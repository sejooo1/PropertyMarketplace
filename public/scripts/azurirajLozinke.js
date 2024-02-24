const fs = require('fs');
const bcrypt = require('bcrypt');

const saltRounds = 10;

// Putanja do datoteke s korisnicima
const putanjaDoDatoteke = 'public/data/korisnici.json';

// Čitanje korisnika iz JSON datoteke
const listaKorisnika = JSON.parse(fs.readFileSync(putanjaDoDatoteke, 'utf8'));

// Funkcija za generiranje hash-a lozinke
function generirajHashLozinke(lozinka, callback) {
  bcrypt.hash(lozinka, saltRounds, (err, hash) => {
    if (err) {
      console.error('Greška prilikom generiranja hash-a:', err);
      return callback(err, null);
    }

    callback(null, hash);
  });
}

// Iteriranje kroz listu korisnika i ažuriranje lozinke
listaKorisnika.forEach(korisnik => {
  generirajHashLozinke(korisnik.password, (err, hash) => {
    if (err) {
      console.error('Greška prilikom generiranja hash-a:', err);
      return;
    }

    // Ažuriranje lozinke u objektu korisnika
    korisnik.password = hash;

    console.log(`Hash lozinke za korisnika ${korisnik.username}: ${hash}`);
  });
});

// Spremanje ažurirane liste korisnika u JSON datoteku
const azuriraniJsonPodaci = JSON.stringify(listaKorisnika, null, 2);
fs.writeFileSync(putanjaDoDatoteke, azuriraniJsonPodaci);

console.log('Ažurirani podaci spremljeni u korisnici.json');
