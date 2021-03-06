/* global describe, beforeEach, spyOn, expect, it, $, */

describe("Testing the AccountsCtrl.", function () {

    var scope, stateParams, createController, httpBackend, loadingService, alertService, accountsService;

    beforeEach(function(){

        angular.mock.module('trevor');
        angular.mock.module('templates');

        inject(function ($injector, LoadingService, AlertService, AccountsService) {

            scope = $injector.get('$rootScope');
            controller = $injector.get('$controller');
            httpBackend = $injector.get('$httpBackend');
            alertService = AlertService;
            loadingService = LoadingService;
            accountsService = AccountsService;

            stateparams = {
                loginid: "johndoe",
                ispro: false
            };

            createController = function() {
                return controller('ReposCtrl', {
                    '$scope' : $injector.get('$rootScope'),
                    '$stateParams' : stateparams,
                    'LoadingService' : loadingService,
                    'AlertService' : alertService,
                    'AccountsService' : accountsService,
                });
            };

        });

    });

    it("Should get the repos for an account.", function () {

        var loginId = stateparams.loginid;
        var isPro = stateparams.ispro;

        data = {
            "repos": [
                {
                    "id": 3334162,
                    "slug": "johndoe/Where-am-I",
                    "description": "A simple app in Swift that uses Core Location & MapKit",
                    "last_build_id": "123213213",
                    "last_build_number": 89,
                    "last_build_state": "passed",
                    "last_build_duration": "65",
                    "last_build_language": "python",
                    "last_build_started_at": null,
                    "last_build_finished_at": null,
                    "active": null,
                    "github_language": "Swift"
                },
                {
                    "id": 2829000,
                    "slug": "johndoe/django-nicend",
                    "description": "A bootstrap backend template. More info coming soon.",
                    "last_build_id": 55733078,
                    "last_build_number": "35",
                    "last_build_state": "passed",
                    "last_build_duration": 32,
                    "last_build_language": null,
                    "last_build_started_at": "2015-03-25T00:08:59Z",
                    "last_build_finished_at": "2015-03-25T00:09:31Z",
                    "active": true,
                    "github_language": "HTML"
                }
            ]};

        httpBackend.expectGET("https://api.travis-ci.org/repos/" + loginId).respond(data);

        var controller = createController();

        httpBackend.flush();

        expect(scope.repos.length).toEqual(1);
        expect(scope.repos[0].short_slug).toBe("django-nicend");

    });

    it("Should FAILT to get the repos for an account.", function () {

        var loginId = stateparams.loginid;
        var isPro = stateparams.ispro;

        spyOn(alertService, 'raiseAlert');

        httpBackend.expectGET("https://api.travis-ci.org/repos/" + loginId).respond(400, "ERROR.");

        var controller = createController();

        httpBackend.flush();

        expect(alertService.raiseAlert).toHaveBeenCalledWith("Oops! We couldn't get your repositories from Travis CI. Please try again.");

    });

});

