const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const path = require('path');

// Uvoz Sequelize modela
const { Korisnik, Nekretnina, Upit, MarketingData } = require('./modeli');

const app = express();
const PORT = 3000;

// Postavke za sesiju
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));

// Omogućavanje JSON parsiranja
app.use(bodyParser.json());

// Postavke za serviranje statičkih datoteka iz 'public' foldera
app.use('/', express.static(path.join(__dirname, 'public')));

// Posluživanje HTML datoteka iz 'public/html' foldera
app.use('/', express.static(path.join(__dirname, 'public/html')));

// Middleware za provjeru autentifikacije korisnika
const checkUser = (req, res, next) => {
  if (!req.session.userId) {
    res.status(401).json({ greska: 'Neautorizovan pristup' });
  } else {
    next();
  }
};

// Ruta: /login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
      const user = await Korisnik.findOne({ where: { username: username } });
      if (user && bcrypt.compareSync(password, user.password)) {
          req.session.userId = user.id;
          res.status(200).json({ poruka: 'Uspješna prijava' });
      } else {
          res.status(401).json({ greska: 'Neuspješna prijava' });
      }
  } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ greska: 'Interna greška servera' });
  }
});


// Ruta: /logout
app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.status(200).json({ poruka: 'Uspješno ste se odjavili' });
  });
});

// Ruta: /nekretnine
app.get('/nekretnine', async (req, res) => {
  const nekretnine = await Nekretnina.findAll();
  res.status(200).json(nekretnine);
});

// Ruta: /upit
app.post('/upit', checkUser, async (req, res) => {
  const { nekretnina_id, tekst_upita } = req.body;
  try {
      const nekretnina = await Nekretnina.findByPk(nekretnina_id);
      if (nekretnina) {
          await Upit.create({
              tekst_upita: tekst_upita,
              nekretninaId: nekretnina_id,
              korisnikId: req.session.userId
          });
          res.status(200).json({ poruka: 'Upit je uspješno dodan' });
      } else {
          res.status(400).json({ greska: `Nekretnina sa id-em ${nekretnina_id} ne postoji` });
      }
  } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ greska: 'Interna greška servera' });
  }
});

app.get('/korisnik', checkUser, async (req, res) => {
  const user = await Korisnik.findByPk(req.session.userId, {
    attributes: ['id', 'username'] // Samo vraćanje sigurnih polja
  });

  if (user) {
    res.status(200).json(user);
  } else {
    res.status(404).json({ greska: 'Korisnik nije pronađen' });
  }
});



// Ruta: /korisnik
app.put('/korisnik', checkUser, async (req, res) => {
  const { ime, prezime, username, password } = req.body;
  try {
      const user = await Korisnik.findByPk(req.session.userId);
      if (user) {
          if (ime) user.ime = ime;
          if (prezime) user.prezime = prezime;
          if (username) user.username = username;
          if (password) user.password = bcrypt.hashSync(password, 10);

          await user.save();
          res.status(200).json({ poruka: 'Podaci su uspješno ažurirani' });
      } else {
          res.status(404).json({ greska: 'Korisnik nije pronađen' });
      }
  } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ greska: 'Interna greška servera' });
  }
});

// Ruta za praćenje filtriranja nekretnina
app.post('/marketing/nekretnine', async (req, res) => {
  const nizNekretnina = req.body.nizNekretnina;
  try {
      for (const id of nizNekretnina) {
          let [marketingData, created] = await MarketingData.findOrCreate({
              where: { idNekretnine: id },
              defaults: { brojKlikova: 0, brojPretraga: 1 }
          });

          if (!created) {
              marketingData.brojPretraga++;
              await marketingData.save();
          }
      }
      res.status(200).json({ message: 'Uspješno obrađeno' });
  } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ greska: 'Interna greška servera' });
  }
});




// Ruta za praćenje klikova na nekretninu
app.post('/marketing/nekretnina/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ greska: 'Neispravan ID' });
  }
  try {
    let [marketingData, created] = await MarketingData.findOrCreate({
      where: { idNekretnine: id },
      defaults: { brojKlikova: 1, brojPretraga: 0 }
    });

    if (!created) {
      marketingData.brojKlikova++;
      await marketingData.save();
    }

    res.status(200).json({ message: 'Uspješno obrađeno' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ greska: 'Interna greška servera' });
  }
});


// Ruta za osvježavanje informacija o pretragama i klikovima
app.post('/marketing/osvjezi', async (req, res) => {
  try {
      const nizNekretnina = req.body.nizNekretnina;
      let response = { nizNekretnina: [] };

      if (!nizNekretnina || nizNekretnina.length === 0) {
          const sviPodaci = await MarketingData.findAll();
          response.nizNekretnina = sviPodaci.map(md => ({
              id: md.idNekretnine,
              pretrage: md.brojPretraga,
              klikovi: md.brojKlikova
          }));
      } else {
          for (const id of nizNekretnina) {
              const marketingData = await MarketingData.findByPk(id);
              if (marketingData) {
                  response.nizNekretnina.push({
                      id: marketingData.idNekretnine,
                      pretrage: marketingData.brojPretraga,
                      klikovi: marketingData.brojKlikova
                  });
              }
          }
      }

      res.json(response);
  } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ greska: 'Interna greška servera' });
  }
});

// Ruta: /nekretnina/:id
app.get('/nekretnina/:id', async (req, res) => {
  try {
    const nekretninaId = req.params.id;
    const nekretnina = await Nekretnina.findByPk(nekretninaId, {
      include: [{
        model: Upit,
        as: 'upiti',
        include: [{
          model: Korisnik,
          attributes: ['username']
        }]
      }]
    });

    if (!nekretnina) {
      res.status(404).json({ greska: 'Nekretnina nije pronađena' });
    } else {
      res.status(200).json(nekretnina);
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ greska: 'Interna greška servera' });
  }
});








// Funkcija za inicijalizaciju baze podataka
async function inicijalizacijaBaze() {
  try {
    // Učitavanje podataka iz JSON datoteka
    const korisniciData = require('./public/data/korisnici.json');
    const nekretnineData = require('./public/data/nekretnine.json');

    // Sinkronizacija modela sa bazom podataka
    await Korisnik.sync();
    await Nekretnina.sync();
    await Upit.sync();
    await MarketingData.sync();

    // Provjera i ubacivanje inicijalnih podataka
    const brojKorisnika = await Korisnik.count();
    if (brojKorisnika === 0) {
      await Korisnik.bulkCreate(korisniciData);
    }

    const brojNekretnina = await Nekretnina.count();
    if (brojNekretnina === 0) {
      await Nekretnina.bulkCreate(nekretnineData.map(n => ({ ...n, upiti: undefined })));

      for (const nekretnina of nekretnineData) {
        if (nekretnina.upiti && nekretnina.upiti.length > 0) {
          for (const upit of nekretnina.upiti) {
            await Upit.create({ 
              tekst_upita: upit.tekst_upita, 
              nekretninaId: nekretnina.id, 
              korisnikId: upit.korisnik_id 
            });
          }
        }
      }
    }
  } catch (error) {
    console.error('Greška prilikom inicijalizacije baze:', error);
  }
}

// Pokretanje servera i inicijalizacija baze
(async () => {
  await inicijalizacijaBaze();
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
})();

module.exports = app;