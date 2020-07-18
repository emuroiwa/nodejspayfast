const express = require("express");
const axios = require("axios");
var crypto = require("crypto");
const router = express.Router();

// @route    POST api/posts
// @desc     Create a post
// @access   Private
router.get("/notify", async (req, res) => {
  try {
    res.status(200).send("Server upp");
    console.log(req);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.get("/form", async (req, res) => {
  var html = "";
  html += "<body>";
  html += "<form action='/thank'  method='post' name='form1'>";
  html += "Name:</p><input type= 'text' name='name'>";
  html += "Email:</p><input type='text' name='email'>";
  html += "address:</p><input type='text' name='address'>";
  html += "Mobile number:</p><input type='text' name='mobilno'>";
  html += "<input type='submit' value='submit'>";
  html += "<INPUT type='reset'  value='reset'>";
  html += "</form>";
  html += "</body>";
  res.send(html);
});

router.get("/", async (req, res) => {
  try {
    var myData = [];
    // Merchant details
    myData["merchant_id"] = "10018579";
    myData["merchant_key"] = "861ou4eazj11v";
    myData["return_url"] = "http://www.localhost/payfast/it.php";
    myData["cancel_url"] = "http://www.localhost/payfast/it.php";
    myData["notify_url"] = "http://www.localhost/payfast/it.php";
    // Buyer details
    myData["name_first"] = "First Name";
    myData["name_last"] = "Last Name";
    myData["email_address"] = "emuroiwa@gmail.com";
    myData["m_payment_id"] = "8542";
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
        pfOutput += key + "=" + encodeURIComponent(value.trim()) + "&";
      }
    }

    // Remove last ampersand
    var getString = pfOutput.slice(0, -1);
    //Uncomment the next line and add a passphrase if there is one set on the account
    var passPhrase = "0914002797Ernest";
    if (typeof passPhrase !== "undefined") {
      getString += "&passphrase=" + encodeURIComponent(passPhrase.trim());
    }

    getString =
      "merchant_id=10018579&merchant_key=861ou4eazj11v&return_url=http%3A%2F%2Fwww.localhost%2Fpayfast%2Fit.php&cancel_url=http%3A%2F%2Fwww.localhost%2Fpayfast%2Fit.php&notify_url=http%3A%2F%2Fwww.localhost%2Fpayfast%2Fit.php&name_first=First+Name&name_last=Last+Name&email_address=emuroiwa%40gmail.com&m_payment_id=8542&amount=10.00&item_name=Item+Name&item_description=Item+Description&custom_int1=9586&custom_str1=custom+string+is+passed+along+with+transaction+to+notify_url+page&passphrase=0914002797Ernest";
    var hash = crypto.createHash("md5").update(getString).digest("hex");
    myData["signature"] = hash;
    // If in testing mode make use of either sandbox.payfast.co.za or www.payfast.co.za

    var testingMode = true;
    var pfHost = testingMode ? "sandbox.payfast.co.za" : "www.payfast.co.za";
    var htmlForm = "";
    htmlForm =
      '<form action="https://' + pfHost + '/eng/process" method="post">';
    for (var key in myData) {
      var value = myData[key];
      if (value !== "") {
        // pfOutput += key + "=" + encodeURI(value.trim()) + "&";
        htmlForm +=
          key +
          '<input name="' +
          key +
          '" type="text" value="' +
          value.trim() +
          '" /><br>';
      }
    }

    htmlForm += '<input type="submit" value="Pay Now" /></form>';

    res.send(htmlForm);
    // var pfHost = testingMode ? "sandbox.payfast.co.za" : "www.payfast.co.za";

    // axios
    //   .post("https://" + pfHost + "/eng/process", JSON.stringify(myData))
    //   .then((res) => {
    //     console.log(`statusCode: ${res.statusCode}`);
    //     console.log(res);
    //   })
    //   .catch((error) => {
    //     console.error(error);
    //   });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
