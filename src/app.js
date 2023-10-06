import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/style.css";
import taskFieldTemplate from "./templates/taskField.html";
import noAccessTemplate from "./templates/noAccess.html";
import tasksTeamplate from "./templates/task.html";
import admin from "./templates/admin.html";
import userHTML from "./templates/user.html";
import { User } from "./models/User";
import { generateTestUser, formNewUser, loadUser } from "./utils";
import { State } from "./state";
import { authUser } from "./services/auth";
import { arrow } from "@popperjs/core";

export const appState = new State();

const loginForm = document.querySelector("#app-login-form");
const hideNavbar = document.querySelector('.navbar');
let userLogin = null;
let userRole = null;

generateTestUser(User);

if (localStorage.getItem('userLogin')) {
  const allUser = JSON.parse(localStorage.getItem('users'));
  userLogin = localStorage.getItem('userLogin');
  let userExist = false;

  allUser.forEach((e) => {
    if (e.login === userLogin) {
      userExist = true;
      return;
    }
  });

  if (userExist) {
    allForms();
    userRole = getRoleByName(userLogin);
    document.querySelector("#content").innerHTML = taskFieldTemplate;
    document.querySelector("#allCont").innerHTML = tasksTeamplate;

    document.querySelectorAll('.me-2').forEach((e) => { e.value = ''; });
    hideNavbar.classList.add('hide');

    taskDisplay();
    catchTextFunc();
    btnAddTask();
  } else {
    localStorage.removeItem('userLogin');
  }
}

loginForm.addEventListener("submit", function (e) {
  e.preventDefault();
  allForms();
  const formData = new FormData(loginForm);
  const login = formData.get("login");
  const password = formData.get("password");

  let fieldHTMLContent;

  if (authUser(login, password)) {
    fieldHTMLContent = taskFieldTemplate;
    localStorage.setItem('userLogin', login);
    userLogin = login;
    userRole = getRoleByName(userLogin);
  } else {
    fieldHTMLContent = noAccessTemplate;
    document.querySelector("#content").innerHTML = fieldHTMLContent;
    return;
  }

  document.querySelector("#content").innerHTML = fieldHTMLContent;
  document.querySelector("#allCont").innerHTML = tasksTeamplate;

  document.querySelectorAll('.me-2').forEach((e) => { e.value = ''; });
  hideNavbar.classList.add('hide');

  taskDisplay();
  catchTextFunc();
  btnAddTask();
});

function allForms() {
  const romb = document.querySelector("#romb");
  const ulPage = document.querySelector("#ulPage");
  const header = document.querySelector(".header");
}

document.addEventListener("click", function (e) {
  if (document.querySelectorAll(".pages").length > 0 && document.querySelector(".pages button") !== e.target && !document.querySelector(".pages button").contains(e.target) && !document.querySelector("#ulPage").classList.contains("hide")) {
    document.querySelector("#ulPage").classList.add("hide");
    document.querySelector("#romb").classList.add("hide");
    const arrow = document.querySelector('.arrow');
    arrow.style.transform = "none";
  }

  if (document.querySelectorAll(".dropdown").length > 0) {
    if (e.target.classList.contains("board__move") || e.target.closest(".board__move") !== null) {
      e.target.closest(".board__buttons").querySelector(".dropdown").classList.remove("hide");
    } else {
      document.querySelectorAll(".dropdown").forEach((elem) => { elem.classList.add("hide"); });
    }
  }

  const edit = document.querySelectorAll('textarea.edited');
  if (edit.length > 0 && e.target.tagName !== 'textarea' && !e.target.classList.contains('edited')) {
    let arrLocal = JSON.parse(localStorage.getItem('task'));
    edit.forEach((e) => {
      const parent = e.parentElement;
      const id = parent.querySelector('.board__item_id').value;
      if (parent.querySelector('textarea').value !== '') {
        arrLocal[id]['text'] = parent.querySelector('textarea').value;
        parent.querySelector('.board__itemText').innerHTML = parent.querySelector('textarea').value;
      } else {
        parent.querySelector('textarea').value = parent.querySelector('.board__itemText').innerHTML;
      }
      parent.querySelector('textarea').classList.add('hide');
      parent.querySelector('.board__itemText').classList.remove('hide');
      parent.querySelector('.board__delete').classList.remove('hide');
    });
    localStorage.setItem('task', JSON.stringify(arrLocal));
  }

  if (document.querySelectorAll('#newTask').length > 0 && e.target.getAttribute('id') !== "newTask" && e.target.closest('.board__buttons') === null) {
    const newTaskText = document.querySelector('#newTask');
    if (newTaskText.value === '') {
      const btnContainer = document.querySelector('#Backlog .board__buttons');
      newTaskText.parentElement.remove();
      btnContainer.querySelector('.board__submit').classList.add('hide');
      btnContainer.querySelector('.board__add').classList.remove('hide');
    }
  }
});

function showMenu() {
  const ulPage = document.querySelector("#ulPage");
  const romb = document.querySelector("#romb");
  const arrow = document.querySelector('.arrow');

  if (ulPage.classList.contains("hide")) {
    ulPage.classList.remove("hide");
    romb.classList.remove("hide");
    arrow.style.transform = "rotate(180deg)";
  } else {
    ulPage.classList.add("hide");
    romb.classList.add("hide");
    arrow.style.transform = "none";
  }
}

window.showMenu = showMenu;

function logOut() {
  const hideNavbar = document.querySelector('.navbar');
  const content = document.querySelector("#content");
  const noAccessTemplate = document.querySelector("./templates/noAccess.html");

  hideNavbar.classList.remove('hide');
  content.innerHTML = noAccessTemplate;
  localStorage.removeItem('userLogin');
}

window.logOut = logOut;

function profile() {
  const userLogin = localStorage.getItem('userLogin');
  const users = JSON.parse(localStorage.getItem('users'));
  const allCont = document.querySelector("#allCont");
  const userHTML = document.querySelector("./templates/user.html");
  const adminTemplate = document.querySelector("./templates/admin.html");

  if (userLogin === 'admin') {
    allCont.classList.remove('hide');
    allCont.innerHTML = adminTemplate;
    formNewUser();
  } else {
    allCont.innerHTML = userHTML;
    document.querySelector('.userName').textContent = `Имя пользователя: ${userLogin}`;
  }

  showMenu();
  loadUser();
}

window.profile = profile;

function taskDisplay() {
  const tasks = JSON.parse(localStorage.getItem('task'));
  const categories = document.querySelectorAll(".board__items");

  categories.forEach((e) => { e.innerHTML = ""; });

  if (tasks !== null && tasks.length > 0) {
    document.querySelectorAll(".board__category .dropdown").forEach((e) => { e.innerHTML = ''; });

    tasks.forEach((e, i) => {
      if (userRole === 'admin' || e.owner === userLogin) {
        if (userRole === 'admin') {
          document.querySelector(`#${e.status} .board__items`).insertAdjacentHTML('beforeend', `<div class="board__item" draggable="true"><div class="board__delete">X</div><div class="userCreate">Создано: ${e.owner}</div><input type="hidden" class="board__item_id" value="${i}"><div class="board__itemText">${e.text}</div><textarea class="board__item_edit hide">${e.text}</textarea></div>`);
        } else {
          document.querySelector(`#${e.status} .board__items`).insertAdjacentHTML('beforeend', `<div class="board__item" draggable="true"><input type="hidden" class="board__item_id" value="${i}"><div class="board__itemText">${e.text}</div><textarea class="board__item_edit hide">${e.text}</textarea></div>`);
        }

        if (getRoleByName(userLogin) === 'admin' || e.owner === userLogin) {
          if (e.status === "Backlog") document.querySelector("#Ready .dropdown").insertAdjacentHTML('beforeend', `<li data-id="${i}">${e.text}</li>`);
          if (e.status === "Ready") document.querySelector("#Progress .dropdown").insertAdjacentHTML('beforeend', `<li data-id="${i}">${e.text}</li>`);
          if (e.status === "Progress") document.querySelector("#Finished .dropdown").insertAdjacentHTML('beforeend', `<li data-id="${i}">${e.text}</li>`);
        }
      }
    });

    document.querySelectorAll(".dropdown li").forEach((li, index) => {
      li.addEventListener('click', function (event) {
        const taskId = this.dataset.id;
        if (tasks[taskId]['status'] === "Progress") tasks[taskId]['status'] = "Finished";
        if (tasks[taskId]['status'] === "Ready") tasks[taskId]['status'] = "Progress";
        if (tasks[taskId]['status'] === "Backlog") tasks[taskId]['status'] = "Ready";
        localStorage.setItem('task', JSON.stringify(tasks));
        taskDisplay();
      });
    });

    if (document.querySelectorAll('.board__delete').length > 0) {
      document.querySelectorAll('.board__item').forEach((e, i) => {
        e.querySelector('.board__delete').addEventListener('click', delItemTask);
      });
    }
  }

  categories.forEach((e) => {
    if (document.querySelector('#Backlog .board__items').childNodes.length === 0) {
      document.querySelector('#Ready .board__move').disabled = true;
    } else {
      document.querySelector('#Ready .board__move').disabled = false;
    }

    if (document.querySelector('#Ready .board__items').childNodes.length === 0) {
      document.querySelector('#Progress .board__move').disabled = true;
    } else {
      document.querySelector('#Progress .board__move').disabled = false;
    }

    if (document.querySelector('#Progress .board__items').childNodes.length === 0) {
      document.querySelector('#Finished .board__move').disabled = true;
    } else {
      document.querySelector('#Finished .board__move').disabled = false;
    }
  });

  catchTextFunc();
  dragAndDrop();
  activeTask();
}

function btnAddTask() {
  const btn = document.querySelectorAll('.board__add');
  btnSubmitTask();

  btn.forEach((e) => {
    e.addEventListener('click', (elem) => {
      const category = elem.target.closest('.board__category').getAttribute("id");
      if (category === 'Backlog') {
        const btnContainer = elem.target.closest('.board__buttons');
        btnContainer.querySelector('.board__submit').classList.remove('hide');
        btnContainer.querySelector('.board__add').classList.add('hide');
        document.querySelector(`#${category} .board__items`).insertAdjacentHTML('beforeend', `<div class="board__item"><textarea id="newTask" class="board__item_edit"></textarea></div>`);
      }
    });
  });
}

function btnSubmitTask() {
  const btn = document.querySelector('.board__submit');
  btn.addEventListener('click', () => {
    const newTaskText = document.querySelector('#newTask').value;
    if (newTaskText !== '') {
      let parseTask = JSON.parse(localStorage.getItem('task'));
      if (parseTask === null) parseTask = [];
      const newTask = {
        text: newTaskText,
        status: 'Backlog',
        owner: userLogin
      };
      parseTask.push(newTask);
      localStorage.setItem('task', JSON.stringify(parseTask));
      const btnContainer = document.querySelector('#Backlog .board__buttons');
      btnContainer.querySelector('.board__submit').classList.add('hide');
      btnContainer.querySelector('.board__add').classList.remove('hide');
      document.querySelector('#newTask').remove();
      taskDisplay();
    }
  });
}

function getRoleByName(name) {
  const allUser = JSON.parse(localStorage.getItem('users'));
  let returnRole = false;
  allUser.forEach((e) => {
    if (name === e.login) returnRole = e.role;
  });
  return returnRole;
}

function delItemTask() {
  const id = this.parentElement.querySelector('.board__item_id').value;
  let allTask = JSON.parse(localStorage.getItem('task'));
  allTask.splice(id, 1);
  localStorage.setItem('task', JSON.stringify(allTask));
  taskDisplay();
}

function dragAndDrop() {
  const taskItems = document.querySelectorAll('.board__item');

  taskItems.forEach((taskItem) => {
    taskItem.addEventListener('dragstart', (event) => {
      event.dataTransfer.setData('text/plain', taskItem.querySelector('.board__item_id').value);
    });
  });

  const boardCategories = document.querySelectorAll('.board__category');

  boardCategories.forEach((category) => {
    category.addEventListener('dragover', (event) => {
      event.preventDefault();
    });

    category.addEventListener('drop', (event) => {
      event.preventDefault();
      const taskId = event.dataTransfer.getData('text/plain');
      const newCategory = category.id;
      const taskList = JSON.parse(localStorage.getItem('task'));
      const taskIndex = parseInt(taskId, 10);

      if (taskList[taskIndex].status !== newCategory) {
        taskList[taskIndex].status = newCategory;
        localStorage.setItem('task', JSON.stringify(taskList));
        taskDisplay();
      }
    });
  });
}

function activeTask() {
  const allTask = JSON.parse(localStorage.getItem('task'));
  let activeTaskCount = 0;
  let finishedTaskCount = 0;

  if (allTask !== null && allTask.length > 0) {
    allTask.forEach((task) => {
      if (userRole === 'admin' || task.owner === userLogin) {
        if (task.status === 'Finished') {
          finishedTaskCount++;
        } else {
          activeTaskCount++;
        }
      }
    });
  }

  document.querySelector('.activeTasks').textContent = `Active tasks: ${activeTaskCount}`;
  document.querySelector('.finishedTask').textContent = `Finished tasks: ${finishedTaskCount}`;
}

