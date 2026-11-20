// Remembers finishes in the browser so a refresh keeps the list.
const STORAGE_KEY = "chroma-saved-finishes";

const saveButtons = document.querySelectorAll(".save");
const savedList = document.querySelector("#saved-list");
const savedMessage = document.querySelector("#saved-message");
const clearButton = document.querySelector("#clear-saved");
const bookingForm = document.querySelector("#booking-form");
const bookingMessage = document.querySelector("#booking-message");
const bookingSaved = document.querySelector("#booking-saved");

let saved = loadSaved();

if (savedList) {
  saveButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      toggleSave(button.dataset.id, button.dataset.name, button.dataset.price);
    });
  });

  clearButton.addEventListener("click", function () {
    saved = [];
    storeSaved();
    render();
  });

  render();
}

if (bookingForm) {
  showBookingSaved();

  bookingForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.querySelector("#guest-name").value.trim();
    const date = document.querySelector("#guest-date").value;

    if (!name || !date) {
      bookingMessage.textContent = "Please add your name and a date.";
      return;
    }

    let note = "Thanks, " + name + ". We have your request for " + date + ".";
    note += " " + savedFinishSentence();

    bookingMessage.textContent = note;
    bookingForm.reset();
  });
}

function loadSaved() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) {
      return [];
    }
    return data;
  } catch (error) {
    return [];
  }
}

function storeSaved() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
}

function toggleSave(id, name, price) {
  const alreadySaved = saved.some(function (item) {
    return item.id === id;
  });

  if (alreadySaved) {
    saved = saved.filter(function (item) {
      return item.id !== id;
    });
  } else {
    saved.push({
      id: id,
      name: name,
      price: Number(price)
    });
  }

  storeSaved();
  render();
}

function savedFinishSentence() {
  if (saved.length === 0) {
    return "You have not saved a finish yet.";
  }

  const names = saved.map(function (item) {
    return item.name;
  });
  return "Saved finishes: " + names.join(", ") + ".";
}

function showBookingSaved() {
  bookingSaved.textContent = savedFinishSentence();
}

function listNames(names) {
  if (names.length === 2) {
    return names[0] + " and " + names[1];
  }
  return names.slice(0, -1).join(", ") + ", and " + names[names.length - 1];
}

function render() {
  savedList.innerHTML = "";

  saved.forEach(function (item) {
    const row = document.createElement("li");
    const label = document.createElement("span");
    label.textContent = item.name + ", $" + item.price;

    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "Remove";
    remove.addEventListener("click", function () {
      toggleSave(item.id, item.name, item.price);
    });

    row.append(label, remove);
    savedList.append(row);
  });

  if (saved.length === 0) {
    savedMessage.textContent = "Save a finish above. Save two or more to compare them.";
  } else if (saved.length === 1) {
    savedMessage.textContent = "One finish saved. Add another if you want to compare.";
  } else {
    const names = saved.map(function (item) {
      return item.name;
    });
    const total = saved.reduce(function (sum, item) {
      return sum + item.price;
    }, 0);
    savedMessage.textContent = "Comparing " + listNames(names) + ". Together they are $" + total + ".";
  }

  clearButton.hidden = saved.length === 0;

  saveButtons.forEach(function (button) {
    const isSaved = saved.some(function (item) {
      return item.id === button.dataset.id;
    });
    const card = button.closest(".card");

    button.setAttribute("aria-pressed", isSaved ? "true" : "false");
    button.textContent = isSaved ? "Saved" : "Save this finish";
    card.classList.toggle("is-saved", isSaved);
  });
}
