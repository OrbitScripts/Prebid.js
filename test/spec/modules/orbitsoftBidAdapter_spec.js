describe('Orbitsoft Adapter tests', function () {
  const expect = require('chai').expect;
  const assert = require('chai').assert;
  const adapter = require('modules/orbitsoftBidAdapter');
  const bidmanager = require('src/bidmanager');
  const adloader = require('src/adloader');
  const CONSTANTS = require('src/constants.json');
  const contentCallEndPoint = 'http://orbitsoft.com/ads/show/content?';
  const jptCallEndPoint = 'http://orbitsoft.com/ads/show/hb?';

  before(() => sinon.stub(document.body, 'appendChild'));
  after(() => document.body.appendChild.restore());

  describe('test orbitsoft callback response', function () {
    it('should exist and be a function', function () {
      expect(pbjs.handleOASCB).to.exist.and.to.be.a('function');
    });

    it('should add empty bid responses if no bids returned', function () {
      let stubAddBidResponse = sinon.stub(bidmanager, 'addBidResponse');

      let bidderRequest = {
        bidderCode: 'orbitsoft',
        bids: [
          {
            bidId: 'bidIdOrbitsoft1',
            bidder: 'orbitsoft',
            params: {
              placementId: '16'
            },
            sizes: [[300, 250]],
            placementCode: 'test-div-12345'
          }
        ]
      };

      // Empty bid response
      let response = {
        callback_uid: 'bidIdOrbitsoft1',
        cpm: 0
      };

      pbjs._bidsRequested.push(bidderRequest);
      // Adapter needs to be called, in order for the stub to register.
      adapter();

      pbjs.handleOASCB(response);

      let bidPlacementCode1 = stubAddBidResponse.getCall(0).args[0];
      let bidResponse1 = stubAddBidResponse.getCall(0).args[1];
      expect(bidPlacementCode1).to.equal('test-div-12345');
      expect(bidResponse1.getStatusCode()).to.equal(CONSTANTS.STATUS.NO_BID);
      expect(bidResponse1.bidderCode).to.equal('orbitsoft');
      stubAddBidResponse.restore();
    });

    it('should add empty bid responses if no bidId returned', function () {
      let stubAddBidResponse = sinon.stub(bidmanager, 'addBidResponse');

      let bidderRequest = {
        bidderCode: 'orbitsoft',
        bids: [
          {
            bidId: 'bidIdOrbitsoft1',
            bidder: 'orbitsoft',
            params: {
              placementId: '16'
            },
            sizes: [[300, 250]],
            placementCode: 'test-div-12345'
          }
        ]
      };

      // Empty bid response
      let response = {
        cpm: 0
      };

      pbjs._bidsRequested.push(bidderRequest);
      // Adapter needs to be called, in order for the stub to register.
      adapter();

      pbjs.handleOASCB(response);

      expect(stubAddBidResponse.getCall(0)).to.equal(null);
      stubAddBidResponse.restore();
    });
  });

  it('should add bid responses if bids are returned', function () {
    let stubAddBidResponse = sinon.stub(bidmanager, 'addBidResponse');

    let bidderRequest = {
      bidderCode: 'orbitsoft',
      bids: [
        {
          bidId: 'bidIdOrbitsoft1',
          bidder: 'orbitsoft',
          params: {
            placementId: '16'
          },
          sizes: [[300, 250]],
          placementCode: 'test-div-12345'
        }
      ]
    };

    // Bid response
    let response = {
      callback_uid: 'bidIdOrbitsoft1',
      content_url: contentCallEndPoint + 'id=1_201707031440_56069e8e70318303e5869fad86722cb0',
      cpm: 0.03,
      width: 300,
      height: 250
    };

    pbjs._bidsRequested.push(bidderRequest);
    // Adapter needs to be called, in order for the stub to register.
    adapter();

    pbjs.handleOASCB(response);

    let bidPlacementCode1 = stubAddBidResponse.getCall(0).args[0];
    let bidResponse1 = stubAddBidResponse.getCall(0).args[1];
    let bid1width = 300;
    let bid1height = 250;
    let cpm = 0.03;
    let content_url = contentCallEndPoint + 'id=1_201707031440_56069e8e70318303e5869fad86722cb0';
    expect(bidPlacementCode1).to.equal('test-div-12345');
    expect(bidResponse1.getStatusCode()).to.equal(CONSTANTS.STATUS.GOOD);
    expect(bidResponse1.bidderCode).to.equal('orbitsoft');
    expect(bidResponse1.width).to.equal(bid1width);
    expect(bidResponse1.height).to.equal(bid1height);
    expect(bidResponse1.cpm).to.equal(cpm);
    expect(bidResponse1.adUrl).to.equal(content_url);
    stubAddBidResponse.restore();
  });

  it('should call loadscript with the correct params', function () {
    let spyLoadScript = sinon.spy(adloader, 'loadScript');
    let params = {
      bids: [
        {
          sizes: [[300, 250], [300, 600]],
          params: {
            placementId: '16'
          }
        }
      ]
    };
    adapter().callBids(params);

    sinon.assert.calledOnce(spyLoadScript);

    let bidUrl = spyLoadScript.getCall(0).args[0];
    expect(bidUrl).to.include('scid=16');
    expect(bidUrl).to.include('size=300x250');
    expect(bidUrl).to.include('loc');
    spyLoadScript.restore();
  });

  describe('test orbitsoft callback with params', function () {
    it('should not call loadscript when inputting with empty params', function () {
      let spyLoadScript = sinon.spy(adloader, 'loadScript');
      adapter().callBids({});
      assert(!spyLoadScript.called);
      spyLoadScript.restore();
    });

    it('should not call loadscript when inputting with empty params by string ', function () {
      let spyLoadScript = sinon.spy(adloader, 'loadScript');
      adapter().callBids('');
      assert(!spyLoadScript.called);
      spyLoadScript.restore();
    });

    it('should call loadscript without size in params', function () {
      let spyLoadScript = sinon.spy(adloader, 'loadScript');
      let params = {
        bids: [
          {
            params: {
              placementId: '16'
            }
          }
        ]
      };
      adapter().callBids(params);

      sinon.assert.calledOnce(spyLoadScript);

      let bidUrl = spyLoadScript.getCall(0).args[0];
      expect(bidUrl).to.include('scid=16');
      expect(bidUrl).to.not.include('size=');
      expect(bidUrl).to.include('loc');
      spyLoadScript.restore();
    });

    it('should add style params to adUrl if bids are returned', function () {
      let stubAddBidResponse = sinon.stub(bidmanager, 'addBidResponse');

      let bidderRequest = {
        bidderCode: 'orbitsoft',
        bids: [
          {
            bidId: 'bidIdOrbitsoft2',
            bidder: 'orbitsoft',
            params: {
              placementId: '16',
              style: {
                title: {
                  family: 'Tahoma',
                  size: 'medium',
                  weight: 'normal',
                  style: 'normal',
                  color: '0053F9'
                },
                description: {
                  family: 'Tahoma',
                  size: 'medium',
                  weight: 'normal',
                  style: 'normal',
                  color: '0053F9'
                },
                url: {
                  family: 'Tahoma',
                  size: 'medium',
                  weight: 'normal',
                  style: 'normal',
                  color: '0053F9'
                },
                colors: {
                  background: 'ffffff',
                  border: 'E0E0E0',
                  link: '5B99FE'
                }
              }
            },
            sizes: [[300, 250]],
            placementCode: 'test-div-12345'
          }
        ]
      };

      // Bid response with content_url
      let response = {
        callback_uid: 'bidIdOrbitsoft2',
        content_url: contentCallEndPoint + 'id=1_201707031440_56069e8e70318303e5869fad86722cb0',
        cpm: 0.03,
        width: 300,
        height: 250
      };

      pbjs._bidsRequested.push(bidderRequest);
      // Adapter needs to be called, in order for the stub to register.
      adapter();

      pbjs.handleOASCB(response);

      let bidResponse1 = stubAddBidResponse.getCall(0).args[1];
      let adUrl = bidResponse1.adUrl;
      let content_url = contentCallEndPoint + 'id=1_201707031440_56069e8e70318303e5869fad86722cb0';
      expect(adUrl).to.include(content_url);
      expect(adUrl).to.include('title.family=Tahoma');
      expect(adUrl).to.include('title.family=Tahoma');
      expect(adUrl).to.include('title.size=medium');
      expect(adUrl).to.include('title.weight=normal');
      expect(adUrl).to.include('title.style=normal');
      expect(adUrl).to.include('title.color=0053F9');
      expect(adUrl).to.include('description.family=Tahoma');
      expect(adUrl).to.include('description.size=medium');
      expect(adUrl).to.include('description.weight=normal');
      expect(adUrl).to.include('description.style=normal');
      expect(adUrl).to.include('description.color=0053F9');
      expect(adUrl).to.include('url.family=Tahoma');
      expect(adUrl).to.include('url.size=medium');
      expect(adUrl).to.include('url.weight=normal');
      expect(adUrl).to.include('url.style=normal');
      expect(adUrl).to.include('url.color=0053F9');
      expect(adUrl).to.include('colors.background=ffffff');
      expect(adUrl).to.include('colors.border=E0E0E0');
      expect(adUrl).to.include('colors.link=5B99FE');

      stubAddBidResponse.restore();
    });

    it('should add custom params to adUrl if bids are returned', function () {
      let stubAddBidResponse = sinon.stub(bidmanager, 'addBidResponse');

      let bidderRequest = {
        bidderCode: 'orbitsoft',
        bids: [
          {
            bidId: 'bidIdOrbitsoft3',
            bidder: 'orbitsoft',
            params: {
              placementId: '16',
              customParams: {
                macro_name: 'macro_value'
              }
            },
            sizes: [[300, 250]],
            placementCode: 'test-div-12345'
          }
        ]
      };

      // Bid response with custom params
      let response = {
        callback_uid: 'bidIdOrbitsoft3',
        content_url: contentCallEndPoint + 'id=1_201707031440_56069e8e70318303e5869fad86722cb0',
        cpm: 0.03,
        width: 300,
        height: 250
      };

      pbjs._bidsRequested.push(bidderRequest);
      // Adapter needs to be called, in order for the stub to register.
      adapter();

      pbjs.handleOASCB(response);

      let bidResponse1 = stubAddBidResponse.getCall(0).args[1];
      let adUrl = bidResponse1.adUrl;
      let content_url = contentCallEndPoint + 'id=1_201707031440_56069e8e70318303e5869fad86722cb0';
      expect(adUrl).to.include(content_url);
      expect(adUrl).to.include('customParams.macro_name=macro_value');

      stubAddBidResponse.restore();
    });
  });
});
