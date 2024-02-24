const MarketingAjax = (() => {
    const BASE_URL = 'http://localhost:3000';
    let intervalPretrage, intervalKlikovi;
    let trenutneNekretnine = []; // Globalni objekt za praćenje trenutnih nekretnina

    const ajaxRequest = async (method, url, data) => {
        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: data ? JSON.stringify(data) : undefined
            });
            return await response.json();
        } catch (error) {
            console.error(`Greška prilikom slanja zahtjeva na ${url}:`, error);
            throw error;
        }
    };

    const osvjeziPretrage = () => {
        intervalPretrage = setInterval(async () => {
            try {
                const response = await ajaxRequest('POST', `${BASE_URL}/marketing/osvjezi`, { nizNekretnina: trenutneNekretnine });
                response.nizNekretnina.forEach(nekretnina => {
                    const pretrageDiv = document.getElementById(`pretrage-${nekretnina.id}Nekretnine`);
                    if (pretrageDiv) {
                        pretrageDiv.textContent = `Pretrage: ${nekretnina.pretrage}`;
                    }
                });
            } catch (error) {
                console.error('Greška prilikom osvježavanja pretraga:', error);
            }
        }, 500);
    };
    
    const osvjeziKlikove = (idNekretnine) => {
        intervalKlikovi = setInterval(async () => {
            try {
                const response = await ajaxRequest('POST', `${BASE_URL}/marketing/osvjezi`, { nizNekretnina: [idNekretnine] });
                response.nizNekretnina.forEach(nekretnina => {
                    const klikoviDiv = document.getElementById(`klikovi-${nekretnina.id}Nekretnine`);
                    if (klikoviDiv) {
                        klikoviDiv.textContent = `Klikovi: ${nekretnina.klikovi}`;
                    }
                });
            } catch (error) {
                console.error('Greška prilikom osvježavanja klikova:', error);
            }
        }, 500);
    };

    const novoFiltriranje = async (listaFiltriranihNekretnina) => {
        const validniIDevi = listaFiltriranihNekretnina.filter(id => id != null);
        trenutneNekretnine = validniIDevi;
    
        try {
            await ajaxRequest('POST', `${BASE_URL}/marketing/nekretnine`, { nizNekretnina: trenutneNekretnine });
            osvjeziPretrage();
        } catch (error) {
            console.error('Greška prilikom slanja informacija o novom filtriranju:', error);
        }
    };
    

    const klikNekretnina = async (idNekretnine) => {
        clearInterval(intervalPretrage);
        try {
            await ajaxRequest('POST', `${BASE_URL}/marketing/nekretnina/${idNekretnine}`);
            osvjeziKlikove(idNekretnine);
        } catch (error) {
            console.error('Greška prilikom slanja informacija o kliku nekretnine:', error);
        }
    };

    return {
        osvjeziPretrage,
        osvjeziKlikove,
        novoFiltriranje,
        klikNekretnina
    };
})();
