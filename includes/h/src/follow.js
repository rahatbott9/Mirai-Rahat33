"use strict";

/**
 * Follow API Module
 * Follow or unfollow users on Facebook
 * 
 * @author Priyansh Rajput
 * @github https://github.com/priyanshufsdev
 * @license MIT
 */

var utils = require("../utils");
var log = require("npmlog");

module.exports = function(defaultFuncs, api, ctx) {
  /**
   * Follow or unfollow a user on Facebook
   * 
   * @param {string} userID - The ID of the user to follow/unfollow
   * @param {boolean} shouldFollow - true to follow, false to unfollow
   * @param {function} callback - Optional callback function
   * @returns {Promise<object>}
   */
  return function follow(userID, shouldFollow, callback) {
    var resolveFunc = function() {};
    var rejectFunc = function() {};
    var returnPromise = new Promise(function(resolve, reject) {
      resolveFunc = resolve;
      rejectFunc = reject;
    });

    if (!callback) {
      callback = function(err, data) {
        if (err) return rejectFunc(err);
        resolveFunc(data);
      };
    }

    // Validation
    if (!userID || typeof userID !== 'string') {
      var error = 'User ID is required and must be a string.';
      log.error('follow', error);
      return callback({ error: error });
    }

    if (typeof shouldFollow !== 'boolean') {
      var error2 = 'shouldFollow must be a boolean (true/false).';
      log.error('follow', error2);
      return callback({ error: error2 });
    }

    var form;
    
    if (shouldFollow) {
      // Follow user
      form = {
        av: ctx.userID,
        fb_api_req_friendly_name: "CometUserFollowMutation",
        fb_api_caller_class: "RelayModern",
        doc_id: "25472099855769847",
        variables: JSON.stringify({
          input: {
            attribution_id_v2: "ProfileCometTimelineListViewRoot.react,comet.profile.timeline.list,via_cold_start,1717249218695,723451,250100865708545,,",
            is_tracking_encrypted: true,
            subscribe_location: "PROFILE",
            subscribee_id: userID,
            tracking: null,
            actor_id: ctx.userID,
            client_mutation_id: "1"
          },
          scale: 1
        })
      };
    } else {
      // Unfollow user
      form = {
        av: ctx.userID,
        fb_api_req_friendly_name: "CometUserUnfollowMutation",
        fb_api_caller_class: "RelayModern",
        doc_id: "25472099855769847",
        variables: JSON.stringify({
          action_render_location: "WWW_COMET_FRIEND_MENU",
          input: {
            attribution_id_v2: "ProfileCometTimelineListViewRoot.react,comet.profile.timeline.list,tap_search_bar,1717294006136,602597,250100865708545,,",
            is_tracking_encrypted: true,
            subscribe_location: "PROFILE",
            tracking: null,
            unsubscribee_id: userID,
            actor_id: ctx.userID,
            client_mutation_id: "10"
          },
          scale: 1
        })
      };
    }

    defaultFuncs
      .post("https://www.facebook.com/api/graphql/", ctx.jar, form)
      .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
      .then(function(res) {
        if (res.errors) {
          throw res.errors[0];
        }
        
        log.info('follow', (shouldFollow ? 'Followed' : 'Unfollowed') + ' user: ' + userID);
        callback(null, { 
          success: true, 
          action: shouldFollow ? 'followed' : 'unfollowed',
          userID: userID 
        });
      })
      .catch(function(err) {
        log.error('follow', err);
        callback(err);
      });

    return returnPromise;
  };
};
