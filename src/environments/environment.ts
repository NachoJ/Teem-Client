// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

import { User } from 'app/shared/interface/user';

export const environment = {
	production: false,
	loginUser: <User>{},

	socket: <any>{},
	isSocketConnected: false,

	BASEAPI: 'http://192.168.0.35:1340/sailsapi',
	PROFILE_IMAGE_PATH: "http://192.168.0.35:1340/upload/profiles/",

	FACEBOOK_API_KEY: "785727668257883",

	LOCAL_ADDRESS: "http://192.168.0.30:4200",

	REGISTER_USER: '/auth/register',
	LOGIN_USER: '/auth/login',
	ACTIVATE_USER: '/auth/useractivation/',
	FORGOT_PASSWORD: '/auth/forgotpassword',
	RESET_PASSWORD: '/auth/resetpassword',
	LOGIN_FB_USER: '/auth/fblogin',
	GET_ALL_SPORTS_CENTERS: '/sportcenter',
	GET_ALL_SPORTS_CENTERS_USER: '/sportcenter/user/',
	GET_SPORTS_CENTERS: '/sportcenter/',
	ADD_SPORTS_CENTER: '/sportcenter',
	DELETE_SPORTS_CENTER: '/sportcenter/',
	GET_FEILDS: '/field/sportcenter/',
	ADD_FEILDS: '/field',
	AUTOCOMPLETE_SPORTSCENTRE: '/sportcenter/autocomplete/',
	GET_ALL_CURRENCY: '/currency',
	GET_CURRENCY: '/currency/',
	GET_ALL_MAIN_SPORTS: 'sport/all',
	GET_ALL_SPORTS: '/sport',
	GET_ALL_SPORTS_WITH_SUB: '/subsport',
	GET_SPORT: '/sport/',
	PROFILE_UPDATE: '/profile',
	PROFILE_IMAGE_UPDATE: '/profile/image/',
	CREATE_MATCH: '/match',
	GET_MATCH: '/match/',
	GET_TEAM_MATCH: '/match/team/',
	UNSUBCRIBE_MATCH: '/match/unsubscribe/',
	NEARBY_MATCH: '/match/nearby',
	GET_BENCH_PLAYERS: '/sportplayer/',
	GET_SUB_SPORTS: '/subsport/list',
	UPDATE_PASSWORD: '/auth/updatepassword',
	CHANGE_EMAIL: '/changeemail',
	INVITATION_SEARCH_PLAYER: '/invitation/usersearch/',
	INVITATION_SEARCH_USER: '/invitation/search/',
	SEND_INVITATIONS: '/invitation',
	GET_MATCH_USER: '/match/user/',
	INVITATION_ACCEPT: '/invitation/accept/',
	INITATION_DELETE: '/invitation/',
	JOIN_MATCH: '/match/join',
	DELETE_MATCH: '/match/',
	GET_LAST_MATCH: '/match/last/user/',
	GET_MATCH_CHAT: '/chatmatch/',
	SEND_CHAT_MESSAGE: '/chatmatch',
	SEARCH: '/search/',
	GET_SEARCH_USER: '/user/search/',
	FOLLOW_USER: '/user/followers',
	UNFOLLOW_USER: '/unfollow/user/',
	UNFOLLOW_SPORTCENTER: '/unfollow/sportcenter/',
	GET_SEARCH_SPORTCENTER: '/sportcenter/search/',
	FOLLOW_SPORTCENTER: '/sportcenter/followers',
	GET_FOLLOWERS: '/followers/',
	GET_FOLLOWING: '/following/',
	GET_PLAYED_MATCHES: '/played/match/',
	GET_ORGANIZED_MATCHES: '/organised/match/',
	USER_SOCKET: '/user/socket/',
	GET_UNREAD_CHAT: '/user/unread/',
	GET_MESSAGES: '/user/message/',
	SEND_PRIVATE_MESSAGE: '/user/message',
	MARK_CHAT_AS_READ: '/user/read/',
	USER_TYPING: '/user/type/',

	GOOGLE_URL_SHORTER: 'https://www.googleapis.com/urlshortener/v1/url?key=AIzaSyBR5otEj6lFr96V9V9eqLeD8FmUiOTJBNg',

	GoogleKey: "&key=AIzaSyDD7oo0yCjyp2pIBLbRr_h3b0_NiMXXu3g"
};
