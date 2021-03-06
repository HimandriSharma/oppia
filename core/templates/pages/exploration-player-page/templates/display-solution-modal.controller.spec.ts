// Copyright 2020 The Oppia Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Unit tests for DisplaySolutionModalController.
 */

// TODO(#7222): Remove the following block of unnnecessary imports once
// the code corresponding to the spec is upgraded to Angular 8.
import { importAllAngularServices } from 'tests/unit-test-utils';
// ^^^ This block is to be removed.

import { TestBed } from '@angular/core/testing';
import { InteractionObjectFactory } from
  'domain/exploration/InteractionObjectFactory';
import { RecordedVoiceoversObjectFactory } from
  'domain/exploration/RecordedVoiceoversObjectFactory';
import { StateCardObjectFactory } from
  'domain/state_card/StateCardObjectFactory';

import { Subscription } from 'rxjs';

describe('Display Solution Modal Controller', function() {
  var $rootScope = null;
  var $scope = null;
  var $uibModalInstance = null;
  var AudioPlayerService = null;
  var AutogeneratedAudioPlayerService = null;
  var AudioTranslationManagerService = null;
  var ContextService = null;
  var HintsAndSolutionManagerService = null;
  var interactionObjectFactory = null;
  var playerTranscriptService = null;
  var recordedVoiceoversObjectFactory = null;
  var SolutionObjectFactory = null;
  var stateCardObjectFactory = null;

  var card = null;
  var solution = null;

  var testSubscriptions = null;
  const autoplayAudioSpy = jasmine.createSpy('autoplayAudio');

  importAllAngularServices();

  beforeEach(angular.mock.module('oppia'));
  beforeEach(function() {
    interactionObjectFactory = TestBed.get(InteractionObjectFactory);
    recordedVoiceoversObjectFactory = TestBed.get(
      RecordedVoiceoversObjectFactory);
    stateCardObjectFactory = TestBed.get(StateCardObjectFactory);
  });

  beforeEach(angular.mock.inject(function($injector, $controller) {
    $rootScope = $injector.get('$rootScope');
    AudioPlayerService = $injector.get('AudioPlayerService');
    AutogeneratedAudioPlayerService = $injector.get(
      'AutogeneratedAudioPlayerService');
    AudioTranslationManagerService = $injector.get(
      'AudioTranslationManagerService');
    ContextService = $injector.get('ContextService');
    spyOn(ContextService, 'getExplorationId').and.returnValue('exp1');

    HintsAndSolutionManagerService = $injector.get(
      'HintsAndSolutionManagerService');
    playerTranscriptService = $injector.get('PlayerTranscriptService');
    SolutionObjectFactory = $injector.get('SolutionObjectFactory');

    $uibModalInstance = jasmine.createSpyObj(
      '$uibModalInstance', ['close', 'dismiss']);

    solution = SolutionObjectFactory.createNew(
      true, 'Correct answer', 'Explanation html', 'exp1');
    spyOn(HintsAndSolutionManagerService, 'displaySolution').and.returnValue(
      solution);

    var interaction = interactionObjectFactory.createFromBackendDict({
      answer_groups: [],
      confirmed_unclassified_answers: [],
      customization_args: {
        placeholder: {value: {content_id: 'ca_placeholder', unicode_str: ''}},
        rows: {value: 1}
      },
      hints: [],
      id: 'TextInput'
    });
    var recordedVoiceovers = recordedVoiceoversObjectFactory.createEmpty();
    card = stateCardObjectFactory.createNewCard(
      'Card 1', 'Content html', 'Interaction text', interaction,
      recordedVoiceovers, 'content_id');
    spyOn(playerTranscriptService, 'getCard').and.returnValue(card);

    testSubscriptions = new Subscription();
    testSubscriptions.add(
      AudioPlayerService.onAutoplayAudio.subscribe(
        autoplayAudioSpy));

    $scope = $rootScope.$new();
    $controller('DisplaySolutionModalController', {
      $rootScope: $rootScope,
      $scope: $scope,
      $uibModalInstance: $uibModalInstance
    });
  }));

  afterEach(() => {
    testSubscriptions.unsubscribe();
  });

  it('should initialize $scope properties after controller is initialized',
    function() {
      expect($scope.isHint).toBe(false);
      expect($scope.shortAnswerHtml).toEqual({
        prefix: 'The only',
        answer: '<oppia-short-response-text-input answer="&amp;quot;' +
          'Correct answer&amp;quot;"></oppia-short-response-text-input>'
      });
      expect($scope.solutionExplanationHtml).toBe('Explanation html');

      expect(autoplayAudioSpy).toHaveBeenCalled();
    });

  it('should stop audio player and cancel auto generated audio player when' +
    ' dismissing modal', function() {
    spyOn(AudioPlayerService, 'stop');
    spyOn(AutogeneratedAudioPlayerService, 'cancel');
    spyOn(AudioTranslationManagerService, 'clearSecondaryAudioTranslations');
    $scope.closeModal();

    expect(AudioPlayerService.stop).toHaveBeenCalled();
    expect(AutogeneratedAudioPlayerService.cancel).toHaveBeenCalled();
    expect(AudioTranslationManagerService.clearSecondaryAudioTranslations)
      .toHaveBeenCalled();
    expect($uibModalInstance.dismiss).toHaveBeenCalledWith('cancel');
  });
});
