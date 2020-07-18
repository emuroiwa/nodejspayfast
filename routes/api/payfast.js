const express = require("express");
const axios = require("axios");
const crypto = require("crypto");
const dns = require('dns');
const router = express.Router();
const testingMode = true;
var pfHost = testingMode ? "sandbox.payfast.co.za" : "www.payfast.co.za";
const passPhrase = "0914002797Ernest";
var yourOrderId = "8542";

// @route    POST api/payfast/notify
// @desc     Callback page which does all the ‘heavy lifting’ with regards to updating your database with payment information etc
// @access   public

router.get("/notify", async (req, res) => {
  try {
    res.status(200).send("Server up");

    //Security check one
    // Posted variables from ITN
    var pfData = req;
    var pfParamString = "";
    for (var key in pfData) {
      var value = myData[key];
      if (key != "signature") {
        pfParamString +=`${key} =${encodeURIComponent(value.trim()).replace(/%20/g, "+")}&`;
      }
    }
    // Remove last ampersand
    var getString = pfOutput.slice(0, -1);
    
    if (typeof passPhrase !== "undefined") {
      getString +=`&passphrase=${encodeURIComponent(passPhrase.trim()).replace(/%20/g, "+")}`;
    }

    var hash = crypto.createHash("md5").update(getString).digest("hex");
    if (hash != pfData['signature']) {
      console.error('Invalid Signature');
      res.status(500).send('Invalid Signature');
    }

    //Security check two
    var validHosts = [
      'www.payfast.co.za',
      'sandbox.payfast.co.za',
      'w1w.payfast.co.za',
      'w2w.payfast.co.za'
    ];

    var validIps = [];
    var pfIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    validHosts.forEach(function(pfHostname) {
      var ips = dns.lookup(pfHostname, function (err, addresses, family) {
        if (addresses !== false || typeof addresses !== "undefined" || addresses !== "") {
          validIps.push(addresses); 
        }     
     });
    });

    var uniqueIps = [...new Set(validIps)];

    if (!uniqueIps.includes(pfIp)) {
      console.error('Source IP not Valid');
      res.status(500).send('Source IP not Valid');

    }

    //Security check three
    var cartTotal = 10; // This amount needs to be sourced from your application
    if (abs(parseFloat(cartTotal) - parseFloat(pfData['amount_gross'])) > 0.01) {
      console.error('Amounts Mismatch');
      res.status(500).send('Amounts Mismatch');
    }

    //Security check four

    axios.post(`https://${pfHost} /eng/query/validate`, {
      pfParamString
    })
    .then((res) => {
      console.log(`statusCode: ${res.statusCode}`)
      console.log(res)
    })
    .catch((error) => {
      console.error(error)
    })

      // you can verify with yourOrderId
    var pfPaymentId = pfData['pf_payment_id'];
    if ( pfPaymentId !== yourOrderId ) {
      console.error('Payment ID Mismatch');
      res.status(500).send('Payment ID Mismatch');

    }

    if( pfData['payment_status'] == 'COMPLETE' ) {
       console.log("Payfast payment success");
       res.status(200).send("Payfast payment success");
    }
    else {
      console.log(pfData['payment_status']);
      res.status(500).send(pfData['payment_status']);
   }
  

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    GET api/payfast/
// @desc     Posting form values to Payfast
// @access   public
router.get("/", async (req, res) => {
  try {
    var myData = [];
    // Merchant details
    myData["merchant_id"] = "10018579";
    myData["merchant_key"] = "861ou4eazj11v";
    myData["return_url"] = "http://www.localhost:8080/api/payfast/return_url";
    myData["cancel_url"] = "http://www.localhost:8080/api/payfast/cancel_url";
    myData["notify_url"] = "http://www.localhost:8080/api/payfast/notify_url";
    // Buyer details
    myData["name_first"] = "First Name";
    myData["name_last"] = "Last Name";
    myData["email_address"] = "emuroiwa@gmail.com";
    myData["m_payment_id"] = yourOrderId;
    myData["amount"] = "10.00";
    myData["item_name"] = "Item Name";
    myData["item_description"] = "Item Description";
    myData["custom_int1"] = "9586";
    myData["custom_str1"] =
      "custom string is passed along with transaction to notify_url page";

    // Create parameter string
    var pfOutput = "";
    for (var key in myData) {
      var value = myData[key];
      if (value !== "") {
        pfOutput +=`${key}=${encodeURIComponent(value.trim()).replace(/%20/g, "+")}&`
      }
    }

    // Remove last ampersand
    var getString = pfOutput.slice(0, -1);
    
    if (typeof passPhrase !== "undefined") {
      getString +=`&passphrase=${encodeURIComponent(passPhrase.trim()).replace(/%20/g, "+")}`;
    }

    var hash = crypto.createHash("md5").update(getString).digest("hex");
    myData["signature"] = hash;
    var htmlForm = "";
    htmlForm =
      `<form action="https://${pfHost}/eng/process" method="post">`;
    for (var key in myData) {
      var value = myData[key];
      if (value !== "") {
        htmlForm +=`<input name="${key}" type="hidden" value="${value.trim()}" />`;
      }
    }

    htmlForm += '<input type="submit" value="Pay Now" /></form>';

    res.send(htmlForm);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});


// @route    GET api/payfast/inapp
// @desc     Posting form values to Payfast
// @access   public
router.get("/inapp", async (req, res) => {
  try {
    var myData = [];
    // Merchant details
    myData["merchant_id"] = "10018579";
    myData["merchant_key"] = "861ou4eazj11v";
    myData["return_url"] = "http://www.localhost:8080/api/payfast/return_url";
    myData["cancel_url"] = "http://www.localhost:8080/api/payfast/cancel_url";
    myData["notify_url"] = "http://www.localhost:8080/api/payfast/notify_url";
    // Buyer details
    myData["name_first"] = "First Name";
    myData["name_last"] = "Last Name";
    myData["email_address"] = "emuroiwa@gmail.com";
    myData["m_payment_id"] = yourOrderId;
    myData["amount"] = "10.00";
    myData["item_name"] = "Item Name";
    myData["item_description"] = "Item Description";
    myData["custom_int1"] = "9586";
    myData["custom_str1"] =
      "custom string is passed along with transaction to notify_url page";

    // Create parameter string
    var pfOutput = "";
    for (var key in myData) {
      var value = myData[key];
      if (value !== "") {
        pfOutput +=`${key}=${encodeURIComponent(value.trim()).replace(/%20/g, "+")}&`
      }
    }

    // Remove last ampersand
    var getString = pfOutput.slice(0, -1);
    
    if (typeof passPhrase !== "undefined") {
      getString +=`&passphrase=${encodeURIComponent(passPhrase.trim()).replace(/%20/g, "+")}`;
    }

    var hash = crypto.createHash("md5").update(getString).digest("hex");
    myData["signature"] = hash;

    var payload = JSON.stringify( myData );
    axios.post(`https://${pfHost}/eng/process`, {
        payload
    })
    .then((response) => {
      res.send(response.data);
    })
    .catch((error) => {
      console.error(error)
    })


  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
// @route    GET api/payfast/return_url
// @desc     Page on your site which the buyer sees after successful payment
// @access   public
router.get("/return_url", async (req, res) => {
  try {
    console.log("Payfast payment success");
    res.status(200).send("Payfast payment success");

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    GET api/payfast/cancel_url
// @desc     Page on your site which the buyer sees after payment is cancelled on PayFast
// @access   public
router.get("/cancel_url", async (req, res) => {
  try {
    console.log("Payfast payment cancelled");
    res.status(500).send("Payfast payment cancelled");

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});


module.exports = router;