var Funnel = require('broccoli-funnel');
var debug = require('debug')('broccoli-stew:mv');
var minimatch = require('minimatch');
var p = require('path');

/**
 * Moves an input tree to a different location.
 *
 * @example
 *
 * var mv = require('broccoli-stew').mv;
 *  given:
 *
 *   root/package.json
 *   root/lib/bar.js
 *   root/lib/foo.js
 *   root/lib/bar.coffee
 *   root/lib/bar.txt
 *
 * var tree = 'root';
 *
 * mv(tree, 'my-lib') => [
 *   root/my-lib/package.json
 *   root/my-lib/lib/bar.js
 *   root/my-lib/lib/foo.js
 *   root/my-lib/lib/bar.coffee
 *   root/my-lib/lib/bar.txt
 * ]
 *
 * mv(tree, 'lib/package.json', 'lib/foo.json') => [
 *   root/lib/foo.json
 *   root/lib/bar.js
 *   root/lib/foo.js
 *   root/lib/bar.coffee
 *   root/lib/bar.txt
 * ]
 *
 * mv(tree, 'lib/*.js', 'src/') => [
 *   root/lib/foo.json
 *   root/src/bar.js
 *   root/src/foo.js
 *   root/lib/bar.coffee
 *   root/lib/bar.txt
 * ]
 *
 * mv(tree, 'lib/*.{js,coffee}', 'src/') => [
 *   root/lib/foo.json
 *   root/src/bar.js
 *   root/src/foo.js
 *   root/src/bar.coffee
 *   root/lib/bar.txt
 * ]
 * 
 * @param  {String|Object} input An input tree that is going to be moved.
 * @param  {String} to    Where you want to move the tree
 * @return {Object}       The tree at the new location
 */
function mv(input, to) {
  var options;

  if (arguments.length === 3) {
    var c = arguments[2];

    var lastChar = to.charAt(to.length - 1);
    var matcher;
    if (lastChar === '/') {
      matcher = to + '**/*';
    } else {
      matcher = to;
    }

    var match = new minimatch.Minimatch(to);

    return new Funnel(input, {
      getDestinationPath: function(path) {
        var glob, matchRegexp, replaceRegexp;

        // sorry for the following LOLcode, hopefully it doesn't do serious damage

        for (var i = 0; i < match.globSet.length; i++) {
          glob = match.globSet[i];

          if (glob.charAt(glob.length - 1) === '/') {
            replaceRegexp = new RegExp(glob.replace('*', '[^/]+'));
          } else if (c.charAt(c.length - 1) === '/') {
            replaceRegexp = new RegExp(p.dirname(glob).replace('*', '[^/]+') + '/');
          } else {
            replaceRegexp = new RegExp(glob.replace('*', '[^/]+'));
          }

          if (minimatch(path, glob)) {
            return path.replace(replaceRegexp, c);
          }
        }

        if (minimatch(path, matcher)) {
          return path.replace(to, c);
        }

        return path;
      }
    });
  }

  if (typeof to === 'function') {
    options = { getDestinationPath: to };
  } else {
    options = { destDir: to };
  }

  debug('mv %s %o', input, options);

  return new Funnel(input, options);
}

module.exports = mv;