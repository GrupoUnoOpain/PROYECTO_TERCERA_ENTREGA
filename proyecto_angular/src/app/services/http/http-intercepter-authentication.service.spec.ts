import { TestBed } from '@angular/core/testing';

import { HttpIntercepterAuthenticationService } from './http-intercepter-authentication.service';

describe('HttpIntercepterAuthenticationService', () => {
  let service: HttpIntercepterAuthenticationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HttpIntercepterAuthenticationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
