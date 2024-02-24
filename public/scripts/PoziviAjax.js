const PoziviAjax = (() => {
    const BASE_URL = 'http://localhost:3000';

    // Funkcija za izvođenje AJAX poziva
    async function ajaxRequest(method, url, data, fnCallback) {
        try {
            const options = {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                }
            };
    
            if (method !== 'GET' && data) {
                options.body = JSON.stringify(data);
            }
    
            const response = await fetch(url, options);
            const responseData = await response.json();
    
            if (fnCallback) {
                fnCallback(null, responseData);
            }
        } catch (error) {
            if (fnCallback) {
                fnCallback(error.message, null);
            }
        }
    }
    

    // Vraća korisnika koji je trenutno prijavljen na sistem
    function impl_getKorisnik(fnCallback) {
        ajaxRequest('GET', `${BASE_URL}/korisnik`, null, fnCallback);
    }

    // Ažurira podatke loginovanog korisnika
    function impl_putKorisnik(noviPodaci, fnCallback) {
        ajaxRequest('PUT', `${BASE_URL}/korisnik`, noviPodaci, fnCallback);
    }

    // Dodaje novi upit za trenutno loginovanog korisnika
    function impl_postUpit(nekretnina_id, tekst_upita, fnCallback) {
        const data = {
            nekretnina_id: nekretnina_id,
            tekst_upita: tekst_upita
        };
        ajaxRequest('POST', `${BASE_URL}/upit`, data, fnCallback);
    }

    // Dohvaća sve nekretnine
    function impl_getNekretnine(fnCallback) {
        ajaxRequest('GET', `${BASE_URL}/nekretnine`, null, fnCallback);
    }

    // Vrši prijavu korisnika
    function impl_postLogin(username, password, fnCallback) {
        const data = {
            username: username,
            password: password
        };
        ajaxRequest('POST', `${BASE_URL}/login`, data, fnCallback);
    }

    // Vrši odjavu korisnika
    function impl_postLogout(fnCallback) {
        ajaxRequest('POST', `${BASE_URL}/logout`, null, fnCallback);
    }

    function impl_getNekretninaById(nekretnina_id, fnCallback) {
        ajaxRequest('GET', `${BASE_URL}/nekretnina/${nekretnina_id}`, null, fnCallback);
      }
      
    
    function handleLoginResponse(error, responseData) {
        if (error) {
            // Prikazati poruku o grešci
            console.error('Greška pri prijavi:', error);
        } else {
            // Provjeriti da li je prijava uspješna
            if (responseData && responseData.poruka === 'Uspješna prijava') {
                window.location.href = 'nekretnine.html'; // Preusmjeravanje na nekretnine.html
            } else {
                // Prikazati poruku o neuspjehu prijave
                alert('Pogrešno korisničko ime ili lozinka.');
            }
        }
    }

    function handleLogoutClick() {
        PoziviAjax.postLogout(function(error, response) {
            if (!error) {
                window.location.href = 'prijava.html';
            } else {
                console.error('Greška prilikom odjave:', error);
            }
        });
    }

    function ažurirajNavigacijskiMeni() {
        PoziviAjax.getKorisnik(function(error, korisnik) {
            if (korisnik && !korisnik.greska) {
                // Korisnik je prijavljen
                document.getElementById('prijava-link').style.display = 'none';
                document.getElementById('odjava-link').style.display = 'block';
                document.getElementById('profil-link').style.display = 'block'; 
                // Ostali linkovi poput "Nekretnine" i "Detalji" su uvijek vidljivi
            } else {
                // Korisnik nije prijavljen
                document.getElementById('prijava-link').style.display = 'block';
                document.getElementById('odjava-link').style.display = 'none';
                document.getElementById('profil-link').style.display = 'none'; 
                // Ostali linkovi poput "Nekretnine" i "Detalji" su uvijek vidljivi
            }
        });
    }

    function postaviOdjavaListener() {
        const odjavaLink = document.getElementById('odjava-link');
        if (odjavaLink) {
            odjavaLink.addEventListener('click', handleLogoutClick);
        }
    }

    async function ucitajNekretnine() {
        return new Promise((resolve, reject) => {
            PoziviAjax.getNekretnine((error, data) => {
                if (error) {
                    console.error('Greška prilikom učitavanja nekretnina:', error);
                    reject(error);
                } else {
                    resolve(data);
                }
            });
        });
    }
    
    
    
      

    return {
        postLogin: impl_postLogin,
        postLogout: impl_postLogout,
        getKorisnik: impl_getKorisnik,
        putKorisnik: impl_putKorisnik,
        postUpit: impl_postUpit,
        getNekretnine: impl_getNekretnine,
        getNekretninaById: impl_getNekretninaById,
        handleLoginResponse: handleLoginResponse,
        handleLogoutClick: handleLogoutClick,
        ažurirajNavigacijskiMeni: ažurirajNavigacijskiMeni,
        postaviOdjavaListener: postaviOdjavaListener,
        ucitajNekretnine: ucitajNekretnine
    };
})();
