let express = require('express');
let snmp = require('net-snmp');
let Sites = require('./sites.json');
let router = express.Router();

let sites = Sites.sites;

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

router.post('/', function( req, res ) {
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

router.post('/site', function(req, res) {
  let id = req.body.id;
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
