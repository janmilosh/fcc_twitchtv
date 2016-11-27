var twitch = {};

twitch.url = 'https://api.twitch.tv/kraken/';
twitch.channels = ['freecodecamp', 'ESL_SC2', 'OgamingSC2', 'tsm_dyrus', 'cretetion', 'storbeck', 'habathcx', 'RobotCaleb', 'noobs2ninjas', 'brunofin', 'comster404'];
twitch.clientID = 'iohqmi5ujw62q74sx2iisqohg3vh6h7';
twitch.accept = 'application/vnd.twitchtv.v3+json';
twitch.createObjects = function(channels) {
  return channels.map(function(channel) {
    return {
      channel: channel,
      channelResponse: '',
      streamResponse: '',
      exists: true,
      noStreamsDivHeight: ''
    }
  });
};

var vm = new Vue({
  el: '#twitch',
  data: {
    responseObjects: twitch.createObjects(twitch.channels),
    fails: { channels: [], text: '' }
  },
  created: function() {
    self = this;
    
    self.responseObjects.forEach(function(responseObj, index) {

      var getChannel = self.makeTwitchRequest('channels/' + responseObj.channel);

      getChannel.done(function(data, textStatus, jqXHR) {
        responseObj.channelResponse = data;
        makeStreamRequest();
      });
      
      getChannel.fail(function(jqXHR, textStatus, errorThrown) {
        if (jqXHR.status === 404) {
          responseObj.exists = false;
        } else {
          console.log('Failed:', textStatus);
        }
        self.updateFailText(responseObj.channel);
      });

      function makeStreamRequest() {
        var getStream = self.makeTwitchRequest('streams?channel=' + responseObj.channel);

        getStream.done(function(data, textStatus, jqXHR) {
          responseObj.streamResponse = data;
          Vue.nextTick(function () {
            responseObj.noStreamsDivHeight = ($('.channel')[index].clientHeight);
          });
        });
        
        getStream.fail(function(jqXHR, textStatus, errorThrown) {
          console.log(responseObj.channel, 'failed with', textStatus);
        });
      }
    });
  },
  methods: {
    makeTwitchRequest: function(urlAddition) {
      
      var url = twitch.url + urlAddition;
      var self = this;
      var promise = $.ajax({
        url: url,
        dataType: 'json',
        headers: {
          'Client-ID': twitch.clientID,
          'Accept': twitch.accept
        }
      })
      return promise;
    },
    updateFailText: function(channel) {
      var obj = this.fails;
      obj.channels.push(channel);
      if (obj.channels.length === 1) {
        obj.text = obj.channels[0] + ' doesn\'t seem to currently have a Twitch account.'
      } else if (obj.channels.length === 2) {
        obj.text = obj.channels[0] + ' and ' + obj.channels[1] + ' don\'t seem to currently have Twitch accounts.'
      } else if (obj.channels.length > 2) {
        obj.text = obj.channels.slice(0, -1).join(', ') + ', and ' + obj.channels.slice(-1) + ' don\'t seem to currently have Twitch accounts.';
      }
    },
    JSONHighlight: function(json) {
      if (typeof json != 'string') {
        json = JSON.stringify(json, undefined, 2);
      }
      json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'key';
            } else {
            cls = 'string';
          }
        } else if (/true|false/.test(match)) {
          cls = 'boolean';
        } else if (/null/.test(match)) {
          cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
      });
    }
  },
  filters: {
    numberWithCommas: function(num) {
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
  }
});