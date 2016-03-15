'use strict';

var trans2 = angular.module('translation', []);

trans2.factory('translate', ['$http', function($http) {

    var trans = {
        current : "En",
        En: null
    };

    var loading = {
    };

    var getTranslation = function(language) {

        if (!(language in trans) || trans[language] == null) {

            if (language in loading) {
                console.log("skipping language file load while in-progress");
                return;
            }

            trans[language] = null;

            loading[language] = null;

            var languageFilePath = 'Images/languages/translation_' + language.toLowerCase() + '.json';
            console.log("LOADING LANGUAGE [" + language + "]");
            $http.get(languageFilePath)
            .then(function(response){
                trans[language] = response.data;
                delete loading[language];
            });
        }
    };

    trans.selectLanguage = function(language) {
        getTranslation(language);
        trans.current = language;
    };

    trans.translate = function(nsString, name) {

        // unloaded language
        if (trans[trans.current] == null) {
            return "(LOADING)";
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

    trans.localizedPath = function (filename) {
        if(filename == 'thankyou.png'){
            if(window.innerHeight > window.innerWidth){
                return '/Images/languages/' + trans.current.toLowerCase() + '/' + filename;
            }else{
                return '/Images/languages/' + trans.current.toLowerCase() + '/' + 'landscape/'+ filename;
            }
        }else{
            return '/Images/languages/' + trans.current.toLowerCase() + '/' + filename;
        }
    };

    return trans;
}]);