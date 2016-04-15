"use strict";
import axios from 'axios'

// TODO: upgrade this to just load all languages in ./languages folder
import en from './languages/en'
import fr from './languages/en'

var trans = {
	current : "En",
	En: en,
	Fr: fr
};

export function selectLanguage(language) {
	trans.current = language;
}

export function translate(nsString, name) {

	// unloaded language
	if (!(trans.current in trans)) {
		return 'unknown language: ' + trans.current;
	}

	// unknown namespace gets @@ in UI
	if (nsString != null && !(nsString in trans[trans.current])) return "@@" + name;

	var dict = trans[trans.current];
	if (nsString != null) {
		dict = dict[nsString];
	}

	if (!(name in dict)) {
		if (nsString == null) {
			return "@" + name;
		} else {
			return "@" + nsString + "::" + name;
		}
	}

	return dict[name];
};

export function currencyFilter(model) {
	// app.js, line 136
	throw new Error('not done!');
}

export function localizedPath(filename) {
	return _localizedPath(filename);
};

export function localizedImage(filename) {
	return _localizedPath(filename);
};

function _localizedPath(filename) {

	return '/gfx/languages/' + trans.current.toLowerCase() + '/' + filename;
	/*
	if (filename == 'thankyou.png'){
		if(window.innerHeight > window.innerWidth){
			return '/Images/languages/' + trans.current.toLowerCase() + '/' + filename;
		} else {
			return '/Images/languages/' + trans.current.toLowerCase() + '/' + 'landscape/'+ filename;
		}
	} else {
		return '/Images/languages/' + trans.current.toLowerCase() + '/' + filename;
	}
	*/
}
