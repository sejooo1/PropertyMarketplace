async function ucitajPodatke(putanja) {
  try {
    const odgovor = await fetch(putanja);
    const textOdgovor = await odgovor.text(); // Prvo dohvati odgovor kao tekst
    const podaci = JSON.parse(textOdgovor); // Zatim ga parsiraj kao JSON
    return podaci;
  } catch (error) {
    console.error('Greška prilikom učitavanja podataka:', error);
    throw error;
  }
}


async function spojiNekretnine(divReferenca, instancaModula, tip_nekretnine, filtriraneNekretnine = null) {
  try {
      let nekretnineZaPrikaz = filtriraneNekretnine || instancaModula.filtrirajNekretnine({ tip_nekretnine: tip_nekretnine });
      divReferenca.innerHTML = ''; // Očistite postojeći sadržaj

      const propertyGridDiv = document.createElement("div");
      propertyGridDiv.classList.add("property-grid");

      nekretnineZaPrikaz.forEach(nekretnina => {
      const nekretninaDiv = document.createElement("div");
      if (nekretnina.tip_nekretnine == "Stan") nekretninaDiv.classList.add("property");
      if (nekretnina.tip_nekretnine == "Kuća") nekretninaDiv.classList.add("property", "house");
      if (nekretnina.tip_nekretnine == "Poslovni prostor") nekretninaDiv.classList.add("property", "commercial");

      const img = document.createElement("img");
      img.alt = nekretnina.naziv;
      img.src = "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500";

      const nameSizeDiv = document.createElement("div");
      nameSizeDiv.classList.add("name-size");
      nameSizeDiv.innerHTML = `
        <h3>${nekretnina.naziv}</h3>
        <p>Kvadratura: ${nekretnina.kvadratura} m²</p>
      `;

      const priceP = document.createElement("p");
      priceP.classList.add("price");
      priceP.textContent = `Cijena: ${nekretnina.cijena} KM`;

      const detailsButton = document.createElement("button");
      detailsButton.classList.add("details-button");
      detailsButton.textContent = "Detalji";
      const pretrageDiv = document.createElement("div");
      pretrageDiv.id = `pretrage-${nekretnina.id}Nekretnine`;
      pretrageDiv.textContent = "Pretrage: 0";

      const klikoviDiv = document.createElement("div");
      klikoviDiv.id = `klikovi-${nekretnina.id}Nekretnine`;
      klikoviDiv.textContent = "Klikovi: 0";

      nekretninaDiv.appendChild(pretrageDiv);
      nekretninaDiv.appendChild(klikoviDiv);

      nekretninaDiv.appendChild(img);
      nekretninaDiv.appendChild(nameSizeDiv);
      nekretninaDiv.appendChild(priceP);
      nekretninaDiv.appendChild(detailsButton);
      let detaljiOtvoreni = false;
      let lokacijaP, godinaP, openDetailsButton;
      detailsButton.addEventListener('click', () => {
        if(!detaljiOtvoreni){
        MarketingAjax.klikNekretnina(nekretnina.id);
        nekretninaDiv.style.position = 'relative';
        nekretninaDiv.style.zIndex = '1000';
        nekretninaDiv.style.width = '500px';
        nekretninaDiv.style.height = 'auto';
        nekretninaDiv.style.overflow = 'visible'; 
        nekretninaDiv.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
          lokacijaP = document.createElement("p");
          lokacijaP.textContent = `Lokacija: ${nekretnina.lokacija}`;
          godinaP = document.createElement("p");
          godinaP.textContent = `Godina izgradnje: ${nekretnina.godina_izgradnje}`;

          openDetailsButton = document.createElement("button");
          openDetailsButton.classList.add("open-details-button");
          openDetailsButton.textContent = "Otvori detalje";
          openDetailsButton.onclick = function() {
            window.location.href = `detalji.html?id=${nekretnina.id}`;
          };

          nekretninaDiv.appendChild(lokacijaP);
          nekretninaDiv.appendChild(godinaP);
          nekretninaDiv.appendChild(openDetailsButton);
          detaljiOtvoreni = true;
        }
        else{
          nekretninaDiv.style.position = '';
          nekretninaDiv.style.zIndex = '';
          nekretninaDiv.style.width = '';
          nekretninaDiv.style.height = '';
          nekretninaDiv.style.overflow = '';
          nekretninaDiv.style.boxShadow = '';
          nekretninaDiv.removeChild(lokacijaP);
          nekretninaDiv.removeChild(godinaP);
          nekretninaDiv.removeChild(openDetailsButton);
          detaljiOtvoreni = false; 
        }
    });
    
      propertyGridDiv.appendChild(nekretninaDiv); 
    });

    divReferenca.appendChild(propertyGridDiv);

    MarketingAjax.novoFiltriranje(filtriraneNekretnine);
  } catch (error) {
    console.error('Greška prilikom spajanja nekretnina:', error);
  }
}

async function filtrirajIPrikaziNekretnine(nekretnineInstance, kriteriji) {
  const filtriraneNekretnineStan = nekretnineInstance.filtrirajNekretnine({...kriteriji, tip_nekretnine: 'Stan'});
  const filtriraneNekretnineKuca = nekretnineInstance.filtrirajNekretnine({...kriteriji, tip_nekretnine: 'Kuća'});
  const filtriraneNekretninePP = nekretnineInstance.filtrirajNekretnine({...kriteriji, tip_nekretnine: 'Poslovni prostor'});

  spojiNekretnine(document.getElementById('stan'), nekretnineInstance, 'Stan', filtriraneNekretnineStan);
  spojiNekretnine(document.getElementById('kuca'), nekretnineInstance, 'Kuća', filtriraneNekretnineKuca);
  spojiNekretnine(document.getElementById('pp'), nekretnineInstance, 'Poslovni prostor', filtriraneNekretninePP);

  const sviIDovi = [...filtriraneNekretnineStan, ...filtriraneNekretnineKuca, ...filtriraneNekretninePP].map(n => n.id);
  MarketingAjax.novoFiltriranje(sviIDovi);
}




(async () => {
  try {
    // Učitavanje podataka o nekretninama
    const listaNekretnina = await PoziviAjax.ucitajNekretnine();

    // Instanciranje modula
    let nekretnine = SpisakNekretnina();
    nekretnine.init(listaNekretnina, []); // Pretpostavljam da lista korisnika nije potrebna
    const filterForm = document.getElementById('filter-button'); 
        filterForm.addEventListener('click', function(event) {
          event.preventDefault();
    
            // Dohvatanje vrijednosti iz input polja
            const minCijena = document.getElementById('min-cijena').value;
            const maxCijena = document.getElementById('max-cijena').value;
            const minKvadratura = document.getElementById('min-kvadratura').value;
            const maxKvadratura = document.getElementById('max-kvadratura').value;
    
            // Kreiranje objekta kriterija
            let kriteriji = {};
            if (minCijena) kriteriji.min_cijena = parseInt(minCijena);
            if (maxCijena) kriteriji.max_cijena = parseInt(maxCijena);
            if (minKvadratura) kriteriji.min_kvadratura = parseInt(minKvadratura);
            if (maxKvadratura) kriteriji.max_kvadratura = parseInt(maxKvadratura);
    
            filtrirajIPrikaziNekretnine(nekretnine, kriteriji);
        });
    filtrirajIPrikaziNekretnine(nekretnine, {});
  } catch (error) {
    console.error('Greška:', error);
  }
})();

