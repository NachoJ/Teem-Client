// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

import { User } from 'app/shared/interface/user';

export const environment = {
  production: false,
  loginUser: <User>{},

  BASEAPI: 'http://192.168.0.35:1337',
  REGISTER_USER: '/auth/register',
  LOGIN_USER: '/auth/login',
  ACTIVATE_USER: '/auth/useractivation/',
  FORGOT_PASSWORD: '/auth/forgotpassword',
  RESET_PASSWORD: '/auth/resetpassword',
  LOGIN_FB_USER: '/auth/fblogin',
  GET_ALL_SPORTS_CENTERS: '/sportcenter',
  GET_SPORTS_CENTERS: '/sportcenter/',
  ADD_SPORTS_CENTER: '/sportcenter',
  DELETE_SPORTS_CENTER: '/sportcenter/',
  GET_FEILDS:'/field/sportcenter/',
  ADD_FEILDS:'/field',
  AUTOCOMPLETE_SPORTSCENTRE: '/sportcenter/autocomplete/',
  GET_ALL_CURRENCY: '/currency',
  GET_CURRENCY: '/currency/',
  GET_ALL_SPORTS: '/sport',
  GET_SPORT: '/sport/',
  CREATE_MATCH: '/match',
  NEARBY_MATCH: '/match/nearby'
};
