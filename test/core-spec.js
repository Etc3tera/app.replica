/* eslint-disable no-undef */
var fs = require('fs')
var shell = require('shelljs')
var assert = require('chai').assert
var expect = require('chai').expect
var sinon = require('sinon')

import Core from '../src/modules/core.js'

describe('Core Function Test', function() {

  beforeEach(function() {
  })
  afterEach(function() {
    sinon.restore()
  })

  it('should process script', function() {
    // Mock
    var readFileSyncStub = sinon.stub(fs, 'readFileSync')
    readFileSyncStub.withArgs('test-script.txt').returns('sourceA\r\ntargetA\r\nsourceB\r\nsomeDir/targetB\r\n')
    var readdirSyncStub = sinon.stub(fs, 'readdirSync')
    readdirSyncStub.withArgs('sourceA').returns(['1.txt', '2.txt', '3.txt'])
    readdirSyncStub.withArgs('targetA').returns(['2.txt', '4.txt'])
    readdirSyncStub.withArgs('sourceB').returns(['1.txt', '2.txt'])
    readdirSyncStub.withArgs('someDir/targetB').returns(['1.txt', '2.txt'])

    // Act
    var results = Core.processScript('test-script.txt')
    
    assert.equal(results.length, 2)
    assert.equal(results[0]['add'].length, 2)
    assert.equal(results[0]['add'][0], '1.txt')
    assert.equal(results[0]['add'][1], '3.txt')
    assert.equal(results[0]['delete'].length, 1)
    assert.equal(results[0]['delete'][0], '4.txt')
    assert.equal(results[1]['add'].length, 0)
    assert.equal(results[1]['delete'].length, 0)
  });

  it('should sync folder', function(done) {
    var readdirSyncStub = sinon.stub(fs, 'readdirSync')
    readdirSyncStub.withArgs('dirA').returns(['1.png', '2.png', '6.png'])
    readdirSyncStub.withArgs('dirB').returns(['1.png', '3.png', '4.png', '5.png'])
    var spyRm = sinon.spy()
    var spyCp = sinon.spy()   
    sinon.stub(shell, 'rm').callsFake(spyRm)
    sinon.stub(shell, 'cp').callsFake(spyCp)

    // Act
    Core.sync('dirA', 'dirB')
      .then(function() {
        assert(spyRm.calledOnce)
        assert(spyCp.calledOnce)
        assert.lengthOf(spyRm.args[0][1], 3)
        assert.lengthOf(spyCp.args[0][1], 2)
        expect(spyRm.args[0][1]).include.members(['dirB/4.png', 'dirB/3.png', 'dirB/5.png'])
        expect(spyCp.args[0][1]).include.members(['dirA/2.png', 'dirA/6.png'])
        assert.equal(spyCp.args[0][2], 'dirB')

        done()
      })
      .catch(function(err){
        done(err)
      })
  })

  it('should not call cp and rm if no difference', function(done) {
    var readdirSyncStub = sinon.stub(fs, 'readdirSync')
    readdirSyncStub.withArgs('dirA').returns(['1.png', '2.png'])
    readdirSyncStub.withArgs('dirB').returns(['1.png', '2.png'])
    var spyRm = sinon.spy()
    var spyCp = sinon.spy()   
    sinon.stub(shell, 'rm').callsFake(spyRm)
    sinon.stub(shell, 'cp').callsFake(spyCp)

    // Act
    Core.sync('dirA', 'dirB')
      .then(function() {
        assert(spyRm.notCalled)
        assert(spyCp.notCalled)

        done()
      })
      .catch(function(err){
        done(err)
      })
  })
});