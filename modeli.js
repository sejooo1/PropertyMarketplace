const Sequelize = require('sequelize');
const sequelize = require('./db'); 

const Korisnik = sequelize.define('korisnik', {
    ime: Sequelize.STRING,
    prezime: Sequelize.STRING,
    username: { type: Sequelize.STRING, unique: true },
    password: Sequelize.STRING
});

const Nekretnina = sequelize.define('nekretnina', {
    tip_nekretnine: Sequelize.STRING,
    naziv: Sequelize.STRING,
    kvadratura: Sequelize.INTEGER,
    cijena: Sequelize.INTEGER,
    tip_grijanja: Sequelize.STRING,
    lokacija: Sequelize.STRING,
    godina_izgradnje: Sequelize.INTEGER,
    datum_objave: Sequelize.STRING,
    opis: Sequelize.TEXT
});

const Upit = sequelize.define('upit', {
    tekst_upita: Sequelize.TEXT,
});

const MarketingData = sequelize.define('MarketingData', {
    idNekretnine: {
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    brojKlikova: Sequelize.INTEGER,
    brojPretraga: Sequelize.INTEGER
});

Nekretnina.hasMany(Upit, { as: 'upiti' });
Upit.belongsTo(Nekretnina);

Korisnik.hasMany(Upit);
Upit.belongsTo(Korisnik);

module.exports = { Korisnik, Nekretnina, Upit, MarketingData };
