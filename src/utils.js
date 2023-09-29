import { User } from "./models/User";

export const getFromStorage = function (key) {
  return JSON.parse(localStorage.getItem(key) || "[]");
};

export const addToStorage = function (obj, key) {
  const storageData = getFromStorage(key);
  storageData.push(obj);
  localStorage.setItem(key, JSON.stringify(storageData));
};

export const generateTestUser = function (User) {
  if(!localStorage.users){
    const testUser = new User("admin", "1", "admin");
    User.save(testUser);
    const testUser2 = new User("2", "2", "user");
    User.save(testUser2);
  }
};

/* заполнение карточки нового пользователя */
export const formNewUser = function(){
  const newUser = document.querySelector('.newUser');
  const formNewLogin = document.querySelector('.newLogin');
  const formNewPassword = document.querySelector('.newPassword');
  const formNewUser = document.querySelector('.btnNewAccess');
  const del = document.querySelector('.btnDel');
  const generalUser = document.createElement('p');

  formNewUser.addEventListener('click', () => {
    const allUser = JSON.parse(localStorage.users); 
    
    const newTestUser = new User(formNewLogin.value, formNewPassword.value, 'user');

    let arrAllUser = true;

    /* Проверка на имя */
    allUser.forEach((e) => {
      if(e.login === newTestUser.login){
        console.log('есть такое')
        arrAllUser = false;
        alert('Имя занято')
      }
    });

    /* Проверка на пустые поля при добавлении пользователя */
    if (formNewLogin.value === '' || formNewPassword.value === ''){
      return false;
    }

    
    if (arrAllUser === true){
      addUser()
      /* Добавление пользователя в localStorege */
      User.save(newTestUser);
    } 
  })

  /* добавление пользователя на экран */

  function addUser(){
    const ulResult = document.querySelector('.ulResult');
    const newUserList = document.createElement('li');
    const btnDel = document.createElement('button');

    newUserList.classList.add("liResult");
    btnDel.classList.add("btnDelete");

    btnDel.innerHTML = `Удалить`;
    newUserList.innerHTML = `Логин: <span>${formNewLogin.value}</span> Пароль: ${formNewPassword.value}`;

    ulResult.append(newUserList);
    newUserList.append(btnDel);
    delUser(btnDel);
  }

}

const delUser = function(btn) {
  btn.addEventListener('click', () => {
    const allUser = JSON.parse(localStorage.users);

    let nameUser = btn.parentElement.querySelector('span').textContent;
    allUser.forEach((e, i) => {
      if(e.login === nameUser){
        allUser.splice(i, 1);
        localStorage.setItem('users', JSON.stringify(allUser));
        btn.parentElement.remove()
        return
      }
    })
  })
}

export function loadUser(){
  const ulResult = document.querySelector('.ulResult');
  let newUserList = document.createElement('li');
  let btnDel = document.createElement('button');

  newUserList.classList.add("liResult");
  btnDel.classList.add("btnDelete");

  const users = JSON.parse(localStorage.getItem('users'));

  if(ulResult != null)
  users.forEach((e) => {
    newUserList = document.createElement('li');

    newUserList.classList.add("liResult");
    btnDel.classList.add("btnDelete");
    
    newUserList.innerHTML = `Логин: <span>${e.login}</span> Пароль: ${e.password}`;

    ulResult.appendChild(newUserList);

    if(e.login != 'admin'){
      btnDel = document.createElement('button');
      btnDel.classList.add("btnDelete");
      btnDel.innerHTML = `Удалить`;
      newUserList.appendChild(btnDel);
      delUser(btnDel);
    }
  })
}