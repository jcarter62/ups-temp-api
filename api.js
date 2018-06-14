let express = require('express');
let snmp = require('net-snmp');
let router = express.Router();

let sites = [
  {
    "name": "field1",
    "ip": "192.168.5.99",
    "nameoid": "1.3.6.1.2.1.1.5.0",
    "locationoid": "1.3.6.1.2.1.1.6.0",
    "tempoid": "1.3.6.1.4.1.318.1.1.10.2.3.2.1.4.1",
    "warn": "80",
    "alarm": "87"
  },
  {
    "name": "field2",
    "ip": "192.168.5.96",
    "nameoid": "1.3.6.1.2.1.1.5.0",
    "locationoid": "1.3.6.1.2.1.1.6.0",
    "tempoid": "1.3.6.1.4.1.318.1.1.10.2.3.2.1.4.1",
    "warn": "80",
    "alarm": "87"
  },
  {
    "name": "fresno1",
    "ip": "172.16.100.132",
    "nameoid": "1.3.6.1.2.1.1.5.0",
    "locationoid": "1.3.6.1.2.1.1.6.0",
    "tempoid": "1.3.6.1.4.1.318.1.1.25.1.2.1.5.2.1",
    "warn": "80",
    "alarm": "87"
  },
  {
    "name": "fresno2",
    "ip": "172.16.100.130",
    "nameoid": "1.3.6.1.2.1.1.5.0",
    "locationoid": "1.3.6.1.2.1.1.6.0",
    "tempoid": "1.3.6.1.4.1.318.1.1.10.2.3.2.1.4.1",
    "warn": "80",
    "alarm": "87"
  }
];

function load1Site(Unit, res, next) {
  let OIds = [Unit.nameoid, Unit.locationoid, Unit.tempoid];
  let session = new snmp.createSession(Unit.ip, "public");

  session.get(OIds,
    (err, varBinds) => {
      if (err) {
        console.log('snmp session.get error: %s', err.toString());
      }
      else {

        let name = "";
        let location = "";
        let data = "";
        for (let i = 0; i < varBinds.length; i++) {
          if (snmp.isVarbindError(varBinds[i])) {
            console.log('snmp.isVarbindError: %s', JSON.stringify(varBinds[i]));
          }
          else {
            let oid = varBinds[i].oid;
            let dat = varBinds[i].value.toString();
            switch (oid) {
              case Unit.nameoid:
                name = dat;
                break;
              case Unit.tempoid:
                data = dat;
                break;
              case Unit.locationoid:
                location = dat;
                break;
              default:
                break;
            }
          }
        }
        let ts = new Date();
        let timeStamp;
        timeStamp = ts.toLocaleString();
        let status = "ok";
        if (data >= Unit.warn) {
          status = "warn";
        }
        if (data >= Unit.alarm) {
          status = "alarm";
        }
        let results = {
          name: name,
          temperature: data,
          location: location,
          timeStamp: timeStamp,
          status: status,
          timestamp: ts.toLocaleTimeString(),
          dateNum: Date.parse(timeStamp)
        };

        next(res, results);
      }
    });
}

function sendResults(res, Results) {
  res.status(200);
  res.send(Results);
}

router.get('/', function( req, res ) {
  let result = {'api': '//' + req.headers.host + req.baseUrl };
  let list = [];

  for ( let i=0; i<sites.length; i++ ) {
    let one = {'name': sites[i].name };
    list.push(one);
  }

  result.AvailableSites = list;

  res.send(result);
});

let getSiteInfo = (id) => {
  let site =null;

  for (let i = 0; i < sites.length; i++) {
    let thisSiteName = sites[i].name;
    if ( id == thisSiteName ) {
      site = sites[i];
    }
  }

  return site;
};

router.get('/:id', function (req, res) {
  let id = req.params.id;
  let site = getSiteInfo(id);

  if (site != null) {
    load1Site(site, res, sendResults)
  } else {
    site = {
      'name': id,
      'message': 'Unknown Site',
      'status': 'error'
    };
    sendResults(res, site);
  }
});

module.exports = router;
