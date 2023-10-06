import { BaseModel } from "./BaseModel";

export class User extends BaseModel {
  constructor(login, password, role) {
    super();
    this.login = login;
    this.password = password;
    this.role = role;
    this.storageKey = "users";
  }

  get hasAccess() {
    let users = getFromStorage(this.storageKey);
    console.log(users);
    if (users.length == 0) return false;
    for (let user of users) {
      if (user.login == this.login && user.password == this.password)
        return true;
    }
    return false;
  }

  static save(user) {
    try {
      const { getFromStorage, addToStorage } = require("../utils");
      addToStorage(user, user.storageKey);
      return true;
    } catch (e) {
      throw new Error(e);
    }
  }
}
