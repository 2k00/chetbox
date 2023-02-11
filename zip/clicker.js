// elvins code except its written by an idiot being carried by an overpowered ide and linter and browser console

let potatoCount = parseInt(localStorage.getItem('potatoCount')) || 0;
let potatoesPerClick = parseInt(localStorage.getItem('ppc')) || 1;
let upAmt = parseInt(localStorage.getItem('upAmt')) || 1;
let acEnabled = localStorage.getItem('acEnabled') ? true : false;
let acInterval = parseInt(localStorage.getItem('acInterval')) || 10000;
var acInt, toggleAcBtn, potatoMlt = 1, skipSave = false, gpChance = 0.01, gpMlt = 10, acOn = true;

function setThing(...ids) { // gonna take up a lot of memory with them stack frames
    for (let id of ids) {
        if (!id) continue;
        else if (id == 'potatoCount') var thing = `You have ${potatoCount.toLocaleString()} potatoes.`;
        else if (id == 'ppc') thing = `Potatoes per click: ${(potatoesPerClick * potatoMlt).toLocaleString()}`;
        else if (id == 'acInterval') thing = `Current autoclicker interval: ${acInterval / 1000} seconds`;
        else if (id == 'upgrade') thing = `+${upAmt.toLocaleString()} potatoes per click (costs ${(300 * upAmt).toLocaleString()} potatoes)`;
        document.getElementById(id).innerHTML = thing;
    }
}
setThing('potatoCount', 'ppc', 'acInterval', 'upgrade');

// here so eslint doesnt complain even though onclick works perfectly fine
document.getElementById('upgrade').addEventListener('click', () => {
    if (broke(300 * upAmt)) return;
    potatoesPerClick += upAmt;
    setThing('ppc');
});
document.getElementById('upgrade2').addEventListener('click', () => upgradeupgradePPC(10));
document.getElementById('unUpgrade2').addEventListener('click', () => upgradeupgradePPC(0.1));
document.getElementById('acEnable').addEventListener('click', () => {
    if (broke(1000)) return;
    acEnabled = true;
    localStorage.setItem('acEnabled', true);
    acBtns();
});

if (acEnabled) {
    acBtns();
    let lastTime = parseInt(localStorage.getItem('lastTime')) || Date.now();
    updateCount(Math.floor((Date.now() - lastTime) / acInterval) * potatoesPerClick);
}

function acBtns() {
    for (let element of Array.from(document.getElementsByClassName('toRemove'))) element.remove(); // have to do Array.from because the element list changes every iteration
    element('button', 'acUpgrade', 'Decrease autoclicker interval (costs 1,000 potatoes)', 'decAcInterval', () => {
        if (acInterval < 501 || broke(1000)) return; // check acInterval first or 1000 will be deducted every time
        changeInterval(acInterval - (acInterval > 1000 ? 1000 : 100));
        localStorage.setItem('acInterval', acInterval);
        document.getElementById('acInterval').innerHTML = `Current autoclicker interval: ${acInterval / 1000} seconds`;
    }); // laziness on whole new levels
    element('br', 'acUpgrade');
    toggleAcBtn = element('button', 'acUpgrade', `Toggle autoclicker (${acOn ? 'ON': 'OFF'} currently)`, 'toggleAcBtn', () => {
        acOn = !acOn;
        toggleAc();
        toggleAcBtn.innerHTML = `Toggle autoclicker (${acOn ? 'ON': 'OFF'} currently)`;
    });
    element('br', 'acUpgrade');
    element('br', 'acUpgrade'); // too lazy to loop
    toggleAc();
}

function toggleAc() {
    if (acOn) acInt = setInterval(updateCount, acInterval);
    else clearInterval(acInt);
}

function changeInterval(interval) { // saves about one line but eats up all your memory
    acInterval = interval;
    clearInterval(acInt); // not sure if this is needed
    acInt = setInterval(updateCount, acInterval);
}

function updateCount(amount = potatoesPerClick) {
    if (amount > 0 && gpChance > Math.random()) amount *= gpMlt;
    potatoCount += amount > 0 ? amount * potatoMlt : amount; // dont affect costs when abilities that affect potatoMlt activate
    setThing('potatoCount'); // not gonna set localStorage cuz setting on page exit is faster
}

function upgradeupgradePPC(amt) {
    if (upAmt * amt < 1) return;
    upAmt = Math.round(upAmt * amt); // floating point errors can make things like +1.0000000000000000001 potatoes happen
    setThing('upgrade');
}

function broke(amount) {
    if (potatoCount < amount) {
        alert(`You're too poor, you need ${amount.toLocaleString()}`);
        return true;
    }
    updateCount(-amount); // im lazy so yes
}

class Ability { // object oriented cuz too lazy to constantly declare variables
    constructor(description, cost, cooldown, duration, enable, disable, updateId = null) {
        this.description = `${description}, cooldown is ${cooldown}`;
        this.cost = cost;
        this.cooldown = cooldown + duration;
        this.duration = duration;
        this.enable = enable;
        this.disable = disable;
        this.updateId = updateId;
        this.enabled = false, this.bought = false;
    }
    usedTime() { return Date.now() - this.useTime; }
    activate = () => { // this syntax is needed because regular function calls redefine this or something like that so i cant call method inside a method
        if (!this.bought && broke(this.cost)) return;
        this.bought = true; // runs every time but who cares
        if (this.usedTime() < this.cooldown * 1000) {
            alert(`Be patient, theres still ${this.cooldown - Math.floor((this.usedTime()) / 1000)} seconds left.`);
            return;
        }
        this.useTime = Date.now();
        this.enabled = true;
        this.enable();
        setThing(this.updateId);
    }; // however () => {} doesn't bother with redefining this so it works
}

let abilities = { // have to do this convoluted mess cuz indexes are unreliable due to new abilities
    'moar potato': new Ability('Adds 1 to the potatoes per click multiplier', 1000, 300, 30, () => potatoMlt += 1, () => potatoMlt -= 1, 'ppc'),
    'even moar potato': new Ability('Adds 3 to the potatoes per click multiplier', 10000, 450, 30, () => potatoMlt += 3, () => potatoMlt -= 3, 'ppc'),
    'moar golden': new Ability('Multiplies chance of golden potato by 10', 10000, 600, 60, () => gpChance *= 10, () => gpChance /= 10),
    'stronk golden': new Ability('Increases golden potato multiplier by 5', 10000, 600, 60, () => gpMlt += 5, () => gpMlt -= 5),
    'stronker golden': new Ability('Increases golden potato multiplier by 10', 15000, 900, 60, () => gpMlt += 10, () => gpMlt -= 10),
    'faster autoclicker': new Ability('Halves autoclicker time if maxed', 100000, 1200, 50, () => acInterval <= 500 ? changeInterval(acInterval / 2) : abilities['faster autoclicker'].useTime = Date.now(),
        () => { if (acInterval < 500) changeInterval(acInterval * 2); }, 'acInterval'), // we dont want overlong lines do we
    'less cooldown': new Ability('Reduces cooldown by 10 seconds', 150000, 1500, 0, () => {
        for (var abilityName in abilities) {
            var ability = abilities[abilityName]; // youd think if i used this loop so many times id write an iterator
            if (!ability.enabled && ability.usedTime() > 10000 && abilityName != 'less cooldown') ability.useTime -= 10000;
        }
    }, () => {}),
    'more time': new Ability('Adds 5 seconds to ability time', 150000, 1500, 0, () => { // instant effect abilities should have 0 time
        for (var abilityName in abilities) {
            var ability = abilities[abilityName]; // nope that aint happening
            if (ability.enabled && ability.duration > 1) ability.useTime += 5000;
        }
    }, () => {})
}; // abilities could be on a separate file...
let storedAbilities = JSON.parse(localStorage.getItem('abilities')) || {};

for (var abilityName in abilities) { // i dont do foreach bcz i aint sure if it give the name which is needed
    var ability = abilities[abilityName], storedAbility = storedAbilities[abilityName];
    element('button', 'abilities', abilityName, abilityName, ability.activate, ability.description);
    if (!storedAbility) continue;
    Object.assign(abilities[abilityName], storedAbility);
    if (Date.now() - storedAbility.useTime < ability.duration * 1000) ability.enable();
}

element('br', 'abilities');
element('br', 'abilities');

setInterval(function() {
    for (var abilityName in abilities) { // i know i repeated this
        ability = abilities[abilityName];
        if (!ability.enabled) continue;
        document.getElementById(abilityName).innerHTML = `${abilityName} | ${Math.floor((ability.useTime + ability.duration * 1000 - Date.now()) / 1000)}s left`;
        if (ability.usedTime() <= ability.duration * 1000) continue;
        ability.enabled = false; // make sure to disable the enabled flag in case disable function fails
        ability.disable();
        setThing(ability.updateId);
        document.getElementById(abilityName).innerHTML = `${abilityName}`;
    }
}, 1000);
setInterval(saveStuff, 5000);
window.addEventListener('beforeunload', saveStuff);
function saveStuff() {
    if (skipSave) return; // this again is the worst possible way
    localStorage.setItem('potatoCount', potatoCount);
    localStorage.setItem('ppc', potatoesPerClick);
    localStorage.setItem('upAmt', upAmt);
    let thing = Object.keys(abilities).reduce((prev, abilityName) => { // *ruby inject flashbacks*
        var ability = abilities[abilityName];
        prev[abilityName] = {bought: ability.bought, useTime: ability.useTime, enabled: ability.enabled};
        return prev;
    }, {});
    localStorage.setItem('abilities', JSON.stringify(thing));
    if (acOn && acEnabled) localStorage.setItem('lastTime', Date.now());
}

function element(type, parent = null, text = null, id = null, click = null, title = null) {
    var elem = document.createElement(type); // this function
    if (id) elem.id = id; // doesnt help
    if (text) elem.innerHTML = text; // but im lazy
    if (click) elem.addEventListener('click', click); // this better work the way i want it to
    if (title) elem.title = title;
    if (parent) document.getElementById(parent).appendChild(elem);
    return elem;
}
