async function prikaziDetaljeNekretnine() {
    const urlParams = new URLSearchParams(window.location.search);
    const nekretninaId = urlParams.get('id');
  
    if (nekretninaId) {
      try {
        const detaljiNekretnine = await dohvatiDetaljeNekretnine(nekretninaId);
        popuniDetaljeNekretnine(detaljiNekretnine);
        popuniUpite(detaljiNekretnine.upiti);
        provjeriLoginISakrijFormuZaUpit();
      } catch (error) {
        console.error('Greška prilikom dohvata detalja nekretnine:', error);
      }
    } else {
      console.error('ID nekretnine nije specificiran u URL-u.');
    }
  }
  
  async function dohvatiDetaljeNekretnine(nekretninaId) {
    return new Promise((resolve, reject) => {
      PoziviAjax.getNekretninaById(nekretninaId, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }
  
  function popuniDetaljeNekretnine(detaljiNekretnine) {
    // Popunjavanje podataka o nekretnini
    document.getElementById('naziv-nekretnine').textContent = `Naziv: ${detaljiNekretnine.naziv}`;
    document.getElementById('kvadratura-nekretnine').textContent = `Kvadratura: ${detaljiNekretnine.kvadratura} m²`;
    document.getElementById('cijena-nekretnine').textContent = `Cijena: ${detaljiNekretnine.cijena} KM`;
    document.getElementById('tip-grijanja').textContent = `Tip grijanja: ${detaljiNekretnine.tip_grijanja}`;
    document.getElementById('lokacija-nekretnine').textContent = `Lokacija: ${detaljiNekretnine.lokacija}`;
    document.getElementById('godina-izgradnje').textContent = `Godina izgradnje: ${detaljiNekretnine.godina_izgradnje}`;        document.getElementById('datum-objave').textContent = `Datum objave: ${detaljiNekretnine.datum_objave}`;
    document.getElementById('opis-nekretnine').textContent = `Opis: ${detaljiNekretnine.opis}`;
  }
  
  function popuniUpite(upiti) {
    const upitiDiv = document.getElementById('upiti');
    upitiDiv.innerHTML = ''; 
  
    upiti.forEach(upit => {
      const upitItem = document.createElement('ul');
      upitItem.classList.add('upit-item');
  
      const korisnikLi = document.createElement('li');
      korisnikLi.innerHTML = `<strong>${upit.korisnik.username}</strong>`;
      upitItem.appendChild(korisnikLi);
  
      const tekstLi = document.createElement('li');
      tekstLi.textContent = upit.tekst_upita;
      upitItem.appendChild(tekstLi);
  
      upitiDiv.appendChild(upitItem);
    });
  }
  
  function provjeriLoginISakrijFormuZaUpit() {
    PoziviAjax.getKorisnik((error, korisnik) => {
      if (!error && korisnik && korisnik.id) {
        document.getElementById('upit-forma').style.display = 'block';
        inicijalizujSlanjeUpita(korisnik.id);
      }
    });
  }
  
  function inicijalizujSlanjeUpita(korisnikId) {
    const dugmePosalji = document.getElementById('posalji-upit');
    const tekstUpitaInput = document.getElementById('tekst-upita');
    const nekretninaId = new URLSearchParams(window.location.search).get('id');
  
    dugmePosalji.addEventListener('click', async () => {
      const tekstUpita = tekstUpitaInput.value;
      if (tekstUpita) {
        try {
          await PoziviAjax.postUpit(nekretninaId, tekstUpita);
          alert('Upit uspješno poslan!');
          await osvjeziUpite(nekretninaId);
        } catch (error) {
          alert('Greška prilikom slanja upita.');
        }
      } else {
        alert('Molimo unesite tekst upita.');
      }
    });
  }
  
  async function osvjeziUpite(nekretninaId) {
    const detaljiNekretnine = await dohvatiDetaljeNekretnine(nekretninaId);
    popuniUpite(detaljiNekretnine.upiti);
  }
  
  document.addEventListener('DOMContentLoaded', prikaziDetaljeNekretnine);
  