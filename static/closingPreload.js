const {app, remote } = require('electron')

const closing = require(remote.app.getPath("temp")+"closing.json")

window.addEventListener('DOMContentLoaded', () => {{
    const closingH1 = document.getElementById("closingText")
    if (closingH1) closingH1.innerHTML=closing.closingMessage;
    console.log(closingH1)
}})