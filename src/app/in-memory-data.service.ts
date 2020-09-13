import { Injectable } from '@angular/core';

import { InMemoryDbService } from 'angular-in-memory-web-api';

import { User } from './user';
import { TestBed } from '@angular/core/testing';

@Injectable({
  providedIn: 'root'
})
export class InMemoryDataService implements InMemoryDbService{

  createDb()
  {
    const users = 
    [
      { id: 1, email: "user", password: "user" }
    ];

    return {users};
  }


  constructor() { }
}
