/**
 * @overview lamb - A lightweight, and docile, JavaScript library to help embracing functional programming.
 * @author Andrea Scartabelli <andrea.scartabelli@gmail.com>
 * @version 0.8.0
 * @module lamb
 * @license MIT
 * @preserve
 */
!function (host) {
    "use strict";

    var lamb = Object.create(null);

    /**
     * The current module version.
     * @memberof module:lamb
     * @private
     * @category Core
     * @type String
     */
    lamb._version =  "0.8.0";
    
    // alias used as a placeholder argument for partial application
    var _ = lamb;
    
    // some prototype shortcuts for internal use
    var _arrayProto = Array.prototype;
    var _fnProto = Function.prototype;
    var _objectProto = Object.prototype;
    var _reProto = RegExp.prototype;
    
    /**
     * Builds a function that returns a constant value.
     * It's actually the simplest form of the K combinator or Kestrel.
     * @example
     * var truth = _.always(true);
     *
     * truth() // => true
     * truth(false) // => true
     * truth(1, 2) // => true
     *
     * // the value being returned is actually the
     * // very same value passed to the function
     * var foo = {bar: "baz"};
     * var alwaysFoo = _.always(foo);
     *
     * alwaysFoo() === foo // => true
     *
     * @memberof module:lamb
     * @category Core
     * @see [SKI combinator calculus]{@link https://en.wikipedia.org/wiki/SKI_combinator_calculus}
     * @param {*} value
     * @returns {Function}
     */
    function always (value) {
        return function () {
            return value;
        };
    }
    
    /**
     * Returns a function that is the composition of the functions given as parameters.
     * Each function consumes the result of the function that follows.
     * @example
     * var sayHi = function (name) { return "Hi, " + name; };
     * var capitalize = function (s) {
     *     return s[0].toUpperCase() + s.substr(1).toLowerCase();
     * };
     * var fixNameAndSayHi = _.compose(sayHi, capitalize);
     *
     * sayHi("bOb") // => "Hi, bOb"
     * fixNameAndSayHi("bOb") // "Hi, Bob"
     *
     * var getName = _.getKey("name");
     * var users = [{name: "fred"}, {name: "bOb"}];
     * var sayHiToUser = _.compose(fixNameAndSayHi, getName);
     *
     * users.map(sayHiToUser) // ["Hi, Fred", "Hi, Bob"]
     *
     * @memberof module:lamb
     * @category Function
     * @param {...Function} fn
     * @returns {Function}
     */
    function compose () {
        var functions = arguments;
    
        return function () {
            var args = arguments;
            var len = functions.length;
    
            while (len--) {
                args = [functions[len].apply(this, args)];
            }
    
            return args[0];
        };
    }
    
    /**
     * Creates generic functions out of methods.
     * @memberof module:lamb
     * @category Core
     * @author [Irakli Gozalishvili]{@link https://github.com/Gozala/}. Thanks for this *beautiful* one-liner (never liked your "unbind" naming choice, though).
     * @function
     * @example
     * // Lamb's "filter" is actually implemented like this
     * var filter = _.generic(Array.prototype.filter);
     * var isLowerCase = function (s) { return s.toUpperCase() !== s; };
     *
     * filter(["Foo", "bar", "baZ"], isLowerCase) // => ["bar"]
     *
     * // the function will work with any array-like object
     * filter("fooBAR", isLowerCase) // => ["f", "o", "o"]
     *
     * @param {Function} method
     * @returns {Function}
     */
    var generic = _fnProto.call.bind(_fnProto.bind, _fnProto.call);
    
    /**
     * The I combinator. Any value passed to the function is simply returned as it is.
     * @example
     * var foo = {bar: "baz"};
     *
     * _.identity(foo) === foo // true
     *
     * @memberof module:lamb
     * @category Core
     * @see [SKI combinator calculus]{@link https://en.wikipedia.org/wiki/SKI_combinator_calculus}
     * @param {*} value
     * @returns {*} The value passed as parameter.
     */
    function identity (value) {
        return value;
    }
    
    /**
     * Builds a partially applied function. The <code>lamb</code> object itself can be used as a placeholder argument:
     * it's useful to alias it as <code>_</code> or <code>__</code>.
     * @example
     * var weights = ["2 Kg", "10 Kg", "1 Kg", "7 Kg"];
     * var parseInt10 = _.partial(parseInt, _, 10);
     *
     * weights.map(parseInt10) // => [2, 10, 1, 7]
     *
     * @memberof module:lamb
     * @category Function
     * @param {Function} fn
     * @param {...*} args
     * @returns {Function}
     */
    function partial (fn) {
        var args = slice(arguments, 1);
    
        return function () {
            var lastArgumentIdx = 0;
            var newArgs = [];
            var argsLen = args.length;
    
            for (var i = 0, boundArg; i < argsLen; i++) {
                boundArg = args[i];
                newArgs[i] = boundArg === _ ? arguments[lastArgumentIdx++] : boundArg;
            }
    
            for (var len = arguments.length; lastArgumentIdx < len; lastArgumentIdx++) {
                newArgs.push(arguments[lastArgumentIdx]);
            }
    
            return fn.apply(this, newArgs);
        };
    }
    
    lamb.always = always;
    lamb.compose = compose;
    lamb.generic = generic;
    lamb.identity = identity;
    lamb.partial = partial;
    
    
    /**
     * Builds an array comprised of all values of the array-like object passing the <code>predicate</code> test.<br/>
     * It's a generic version of [Array.prototype.filter]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter}.
     * @example
     * var isLowerCase = function (s) { return s.toUpperCase() !== s; };
     *
     * _.filter(["Foo", "bar", "baZ"], isLowerCase) // => ["bar"]
     *
     * // the function will work with any array-like object
     * _.filter("fooBAR", isLowerCase) // => ["f", "o", "o"]
     *
     * @memberof module:lamb
     * @category Array
     * @function
     * @param {ArrayLike} arrayLike
     * @param {ListIteratorCallback} predicate
     * @param {Object} [predicateContext]
     * @returns {Array}
     */
    var filter = generic(_arrayProto.filter);
    
    /**
     * Executes the provided <code>iteratee</code> for each element of the given array-like object.<br/>
     * It's a generic version of [Array.prototype.forEach]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach}.
     * @example <caption>Adding a CSS class to all elements of a NodeList in a browser environment</caption>
     * var addClass = function (className) {
     *     return function (element) {
     *         element.classList.add(className);
     *     };
     * };
     * var paragraphs = document.querySelectorAll("#some-container p");
     *
     * _.forEach(paragraphs, addClass("main"));
     * // each "p" element in the container will have the "main" class now
     *
     * @memberof module:lamb
     * @category Array
     * @function
     * @param {ArrayLike} arrayLike
     * @param {ListIteratorCallback} iteratee
     * @param {Object} [iterateeContext]
     */
    var forEach = generic(_arrayProto.forEach);
    
    /**
     * Creates an array from the results of the provided <code>iteratee</code>.<br/>
     * It's a generic version of [Array.prototype.map]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map}.
     * @example
     * function getSquareRoots () {
     *     return _.map(arguments, Math.sqrt);
     * }
     *
     * getSquareRoots(4, 9, 16) // => [2, 3, 4]
     *
     * @memberof module:lamb
     * @category Array
     * @function
     * @param {ArrayLike} arrayLike
     * @param {ListIteratorCallback} iteratee
     * @param {Object} [iterateeContext]
     * @returns {Array}
     */
    var map = generic(_arrayProto.map);
    
    /**
     * Reduces (or folds) the values of an array-like object, starting from the first, to a new value using the provided <code>accumulator</code> function.<br/>
     * It's a generic version of [Array.prototype.reduce]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce}.
     * @example
     * _.reduce([1, 2, 3, 4], _.add) // => 10
     *
     * @memberof module:lamb
     * @category Array
     * @function
     * @param {ArrayLike} arrayLike
     * @param {AccumulatorCallback} accumulator
     * @param {*} [initialValue]
     * @returns {*}
     */
    var reduce = generic(_arrayProto.reduce);
    
    /**
     * Same as {@link module:lamb.reduce|reduce}, but starts the fold operation from the last element instead.<br/>
     * It's a generic version of [Array.prototype.reduceRight]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduceRight}.
     * @memberof module:lamb
     * @category Array
     * @function
     * @param {ArrayLike} arrayLike
     * @param {AccumulatorCallback} accumulator
     * @param {*} [initialValue]
     * @returns {*}
     */
    var reduceRight = generic(_arrayProto.reduceRight);
    
    /**
     * Builds an array by extracting a portion of an array-like object.<br/>
     * It's a generic version of [Array.prototype.slice]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice}.
     * @example
     * _.slice(["foo", "bar", "baz"], 0, 2) // => ["foo", "bar"]
     *
     * @memberof module:lamb
     * @category Array
     * @function
     * @param {ArrayLike} arrayLike - Any array like object.
     * @param {Number} [start=0] - Zero-based index at which to begin extraction.
     * @param {Number} [end=arrayLike.length] - Zero-based index at which to end extraction. Extracts up to but not including end.
     * @returns {Array}
     */
    var slice = generic(_arrayProto.slice);
    
    lamb.filter = filter;
    lamb.forEach = forEach;
    lamb.map = map;
    lamb.reduce = reduce;
    lamb.reduceRight = reduceRight;
    lamb.slice = slice;
    
    
    var _concat = generic(_arrayProto.concat);
    
    function _findSliceEndIndex (arrayLike, predicate, predicateContext) {
        var idx = -1;
        var len = arrayLike.length;
    
        while (++idx < len && predicate.call(predicateContext, arrayLike[idx], idx, arrayLike));
    
        return idx;
    }
    
    function _flatten (array, output) {
        output = output || [];
    
        array.forEach(function (value) {
            if (Array.isArray(value)) {
                _flatten(value, output);
            } else {
                output.push(value);
            }
        });
    
        return output;
    }
    
    function _shallowFlatten (array) {
        return _arrayProto.concat.apply([], array);
    }
    
    function _getInsertionIndex (array, element, comparer, reader, start, end) {
        if (array.length === 0) {
            return 0;
        }
    
        comparer = comparer || sorter.ascending;
        reader = reader || identity;
        start = start || 0;
        end = end || array.length;
    
        var pivot = (start + end) >> 1;
        var compared = comparer(reader(element), reader(array[pivot]));
    
        if (end - start <= 1) {
            return compared === -1 ? pivot : pivot + 1;
        }
    
        switch (compared) {
            case -1:
                return _getInsertionIndex(array, element, comparer, reader, start, pivot);
            case 0:
                return pivot + 1;
            case 1:
                return _getInsertionIndex(array, element, comparer, reader, pivot, end);
        }
    }
    
    /**
     * Returns an array of items present only in the first of the given arrays.
     * @example
     * var a1 = [1, 2, 3, 4];
     * var a2 = [2, 4, 5];
     * var a3 = [4, 5, 3, 1];
     *
     * _.difference(a1, a2) // => [1, 3]
     * _.difference(a1, a2, a3) // => []
     *
     * @memberof module:lamb
     * @category Array
     * @param {Array} array
     * @param {...Array} other
     * @returns {Array}
     */
    function difference (array) {
        var rest = _shallowFlatten(slice(arguments, 1));
        return array.filter(function (item) {
            return rest.indexOf(item) === -1;
        });
    }
    
    /**
     * Builds an array without the first <code>n</code> elements of the given array or array-like object.
     * Note that, being this only a shortcut for a specific use case of {@link module:lamb.slice|slice},
     * <code>n</code> can be a negative number.
     * @example
     * var arr = [1, 2, 3, 4, 5];
     *
     * _.drop(arr, 2) // => [3, 4, 5]
     * _.drop(arr, -1) // => [5]
     * _.drop(arr, -10) // => [1, 2, 3, 4, 5]
     *
     * @memberof module:lamb
     * @category Array
     * @function
     * @param {ArrayLike} arrayLike
     * @param {Number} n
     * @returns {Array}
     */
    var drop = aritize(slice, 2);
    
    /**
     * A curried version of {@link module:lamb.drop|drop} that expects the number of elements
     * to drop to build a function waiting for the list to take the elements from.
     * See the note and examples for {@link module:lamb.drop|drop} about passing a negative <code>n</code>.
     * @example
     * var drop2 = _.dropN(2);
     *
     * drop2([1, 2, 3, 4, 5]) // => [3, 4, 5]
     *
     * @memberof module:lamb
     * @category Array
     * @function
     * @param {Number} n
     * @returns {Function}
     */
    var dropN = _curry(drop, 2, true);
    
    /**
     * Builds a function that drops the first <code>n</code> elements satisfying a predicate from an array or array-like object.
     * @example
     * var isEven = function (n) { return n % 2 === 0; };
     * var dropWhileIsEven = _.dropWhile(isEven);
     *
     * dropWhileIsEven([2, 4, 6, 8]) // => []
     * dropWhileIsEven([2, 4, 7, 8]) // => [7, 8]
     *
     * @memberof module:lamb
     * @category Array
     * @param {ListIteratorCallback} predicate
     * @param {Object} [predicateContext]
     * @returns {Function}
     */
    function dropWhile (predicate, predicateContext) {
        return function (arrayLike) {
            return slice(arrayLike, _findSliceEndIndex(arrayLike, predicate, predicateContext));
        };
    }
    
    /**
     * Searches for an element satisfying the predicate in the given array-like object and returns it if
     * the search is successful. Returns <code>undefined</code> otherwise.
     * @example
     * var persons = [
     *     {"name": "Jane", "surname": "Doe", "age": 12},
     *     {"name": "John", "surname": "Doe", "age": 40},
     *     {"name": "Mario", "surname": "Rossi", "age": 18},
     *     {"name": "Paolo", "surname": "Bianchi", "age": 40}
     * ];
     *
     * _.find(persons, _.hasKeyValue("age", 40)) // => {"name": "John", "surname": "Doe", "age": 40}
     * _.find(persons, _.hasKeyValue("age", 41)) // => undefined
     *
     * @memberof module:lamb
     * @category Array
     * @param {ArrayLike} arrayLike
     * @param {ListIteratorCallback} predicate
     * @param {Object} [predicateContext]
     * @returns {*}
     */
    function find (arrayLike, predicate, predicateContext) {
        var result;
    
        for (var i = 0, len = arrayLike.length, element; i < len; i++) {
            element = arrayLike[i];
    
            if (predicate.call(predicateContext, element, i, arrayLike)) {
                result = element;
                break;
            }
        }
    
        return result;
    }
    
    /**
     * Searches for an element satisfying the predicate in the given array-like object and returns its
     * index if the search is successful. Returns <code>-1</code> otherwise.
     * @example
     * var persons = [
     *     {"name": "Jane", "surname": "Doe", "age": 12},
     *     {"name": "John", "surname": "Doe", "age": 40},
     *     {"name": "Mario", "surname": "Rossi", "age": 18},
     *     {"name": "Paolo", "surname": "Bianchi", "age": 40}
     * ];
     *
     * _.findIndex(persons, _.hasKeyValue("age", 40)) // => 1
     * _.findIndex(persons, _.hasKeyValue("age", 41)) // => -1
     *
     * @memberof module:lamb
     * @category Array
     * @param {ArrayLike} arrayLike
     * @param {ListIteratorCallback} predicate
     * @param {Object} [predicateContext]
     * @returns {Number}
     */
    function findIndex (arrayLike, predicate, predicateContext) {
        var result = -1;
    
        for (var i = 0, len = arrayLike.length; i < len; i++) {
            if (predicate.call(predicateContext, arrayLike[i], i, arrayLike)) {
                result = i;
                break;
            }
        }
    
        return result;
    }
    
    /**
     * Similar to {@link module:lamb.map|map}, but if the mapping function returns an array this will
     * be concatenated, rather than pushed, to the final result.
     * @example <caption>showing the difference with map</caption>
     * var words = ["foo", "bar"];
     * var toCharArray = function (s) { return s.split(""); };
     *
     * _.map(words, toCharArray) // => [["f", "o", "o"], ["b", "a", "r"]]
     * _.flatMap(words, toCharArray) // => ["f", "o", "o", "b", "a", "r"]
     *
     * @memberof module:lamb
     * @category Array
     * @function
     * @param {Array} array
     * @param {ListIteratorCallback} iteratee
     * @param {Object} [iterateeContext]
     * @returns {Array}
     */
    var flatMap = compose(_shallowFlatten, map);
    
    /**
     * Flattens an array.
     * @example
     * var arr = [1, 2, [3, 4, [5, 6]], 7, 8];
     *
     * _.flatten(arr) // => [1, 2, 3, 4, 5, 6, 7, 8]
     * _.flatten(arr, true) // => [1, 2, 3, 4, [5, 6], 7, 8]
     *
     * @memberof module:lamb
     * @category Array
     * @param {Array} array
     * @param {Boolean} [doShallow=false] - Whether to flatten only the first "level" of the array or not.
     * @returns {Array}
     */
    function flatten (array, doShallow) {
        return (doShallow ? _shallowFlatten : _flatten)(array);
    }
    
    /**
     * Transforms an array-like object into a lookup table using the provided iteratee as a grouping
     * criterion to generate keys and values.
     * @example
     * var persons = [
     *     {"name": "Jane", "city": "New York"},
     *     {"name": "John", "city": "New York"},
     *     {"name": "Mario", "city": "Rome"},
     *     {"name": "Paolo"}
     * ];
     * var getCity = _.getKey("city");
     * var personsByCity = _.group(persons, getCity);
     *
     * // "personsByCity" holds:
     * // {
     * //     "New York": [
     * //         {"name": "Jane", "city": "New York"},
     * //         {"name": "John", "city": "New York"}
     * //     ],
     * //     "Rome": [
     * //         {"name": "Mario", "city": "Rome"}
     * //     ],
     * //     "undefined": [
     * //         {"name": "Paolo"}
     * //     ]
     * // }
     *
     * @example <caption>Adding a custom value for missing keys</caption>
     *
     * var getCityOrUnknown = _.condition(
     *     _.hasKey("city"),
     *     getCity,
     *     _.always("Unknown")
     * );
     *
     * personsByCity = _.group(persons, getCityOrUnknown);
     *
     * // "personsByCity" now holds:
     * // {
     * //     "New York": [
     * //         {"name": "Jane", "city": "New York"},
     * //         {"name": "John", "city": "New York"}
     * //     ],
     * //     "Rome": [
     * //         {"name": "Mario", "city": "Rome"}
     * //     ],
     * //     "Unknown": [
     * //         {"name": "Paolo"}
     * //     ]
     * // }
     *
     * @memberof module:lamb
     * @category Array
     * @param {ArrayLike} arrayLike
     * @param {ListIteratorCallback} iteratee
     * @param {Object} [iterateeContext]
     * @returns {Object}
     */
    function group (arrayLike, iteratee, iterateeContext) {
       var result = {};
        var len = arrayLike.length;
    
        for (var i = 0, element; i < len; i++) {
            element = arrayLike[i];
            var key = iteratee.call(iterateeContext, element, i, arrayLike);
    
            if (key in result) {
                result[key].push(element);
            } else {
                result[key] = [element];
            }
        }
    
        return result;
    }
    
    /**
     * Using the provided iteratee, and its optional context, builds a [partial application]{@link module:lamb.partial}
     * of {@link module:lamb.group|group} expecting the array-like object to act upon.
     * @example
     * var persons = [
     *     {"name": "Jane", "age": 12},
     *     {"name": "John", "age": 40},
     *     {"name": "Mario", "age": 18},
     *     {"name": "Paolo", "age": 15}
     * ];
     *
     * var getAgeStatus = function (person) { return person.age > 20 ? "over 20" : "under 20"; };
     * var groupByAgeStatus = _.groupBy(getAgeStatus);
     *
     * var personsByAgeStatus = groupByAgeStatus(persons);
     *
     * // "personsByAgeStatus" holds:
     * // {
     * //     "under 20": [
     * //         {"name": "Jane", "age": 12},
     * //         {"name": "Mario", "age": 18},
     * //         {"name": "Paolo", "age": 15}
     * //     ],
     * //     "over 20": [
     * //         {"name": "John", "age": 40}
     * //     ]
     * // }
     *
     * @memberof module:lamb
     * @category Array
     * @param {ListIteratorCallback} iteratee
     * @param {Object} [iterateeContext]
     * @returns {Function}
     */
    function groupBy (iteratee, iterateeContext) {
        return partial(group, _, iteratee, iterateeContext);
    }
    
    /**
     * Returns an array of every item present in all given arrays.
     * @example
     * var a1 = [1, 2, 3, 4];
     * var a2 = [2, 5, 4, 6];
     * var a3 = [5, 6, 7];
     *
     * _.intersection(a1, a2) // => [2, 4]
     * _.intersection(a1, a3) // => []
     *
     * @memberof module:lamb
     * @category Array
     * @param {...Array} array
     * @return {Array}
     */
    function intersection () {
        var rest = slice(arguments, 1);
        return uniques(arguments[0]).filter(function (item) {
            return rest.every(function (other) {
                return other.indexOf(item) !== -1;
            });
        });
    }
    
    /**
     * Inserts an element in a copy of a sorted array respecting the sort order.
     * @example <caption>with simple values</caption>
     * _.insert([], 1) // => [1]
     * _.insert([2, 4, 6], 5) // => [2, 4, 5, 6]
     * _.insert([4, 2, 1], 3, _.sorter.descending) // => [4, 3, 2, 1]
     *
     * @example <caption>with complex values</caption>
     * var persons = [
     *     {"name": "jane", "surname": "doe"},
     *     {"name": "John", "surname": "Doe"},
     *     {"name": "Mario", "surname": "Rossi"}
     * ];
     *
     * var getLowerCaseName = _.compose(
     *     _.invoker("toLowerCase"),
     *     _.getKey("name")
     * );
     *
     * var result = _.insert(
     *     persons,
     *     {"name": "marco", "surname": "Rossi"},
     *     _.sorter.ascending,
     *     getLowerCaseName
     * );
     *
     * // `result` holds:
     * // [
     * //     {"name": "jane", "surname": "doe"},
     * //     {"name": "John", "surname": "Doe"},
     * //     {"name": "marco", "surname": "Rossi"},
     * //     {"name": "Mario", "surname": "Rossi"}
     * // ]
     *
     * @memberof module:lamb
     * @category Array
     * @param {Array} array
     * @param {*} element
     * @param {Function} [comparer={@link module:lamb.sorter|sorter.ascending}] - The comparer function used to sort the array.
     * @param {Function} [reader={@link module:lamb.identity|identity}] - The function that evaluates the array elements and supplies values for comparison.
     * @returns {Array}
     */
    function insert (array, element, comparer, reader) {
        var result = array.concat();
        result.splice(_getInsertionIndex(array, element, comparer, reader), 0, element);
        return result;
    }
    
    /**
     * Generates an array with the values passed as arguments.
     * @example
     * _.list(1, 2, 3) // => [1, 2, 3]
     *
     * @memberof module:lamb
     * @category Array
     * @param {...*} value
     * @returns {Array}
     */
    function list () {
        return slice(arguments);
    }
    
    /**
     * A curried version of {@link module:lamb.map|map} that uses the given iteratee to build a
     * function expecting the array-like object to act upon.
     * @example
     * var square = function (n) { return n * n; };
     * var getSquares = _.mapWith(square);
     *
     * getSquares([1, 2, 3, 4, 5]) // => [1, 4, 9, 16, 25]
     *
     * @memberof module:lamb
     * @category Array
     * @param {ListIteratorCallback} iteratee
     * @param {Object} [iterateeContext]
     * @returns {function}
     */
    function mapWith (iteratee, iterateeContext) {
        return partial(map, _, iteratee, iterateeContext);
    }
    
    /**
     * "Plucks" the specified key from a list of objects.
     * @example
     * var persons = [
     *     {"name": "Jane", "surname": "Doe", "age": 12},
     *     {"name": "John", "surname": "Doe", "age": 40},
     *     {"name": "Mario", "surname": "Rossi", "age": 18},
     *     {"name": "Paolo", "surname": "Bianchi", "age": 15}
     * ];
     *
     * _.pluck(persons, "age") // => [12, 40, 18, 15]
     *
     * var lists = [
     *     [1, 2],
     *     [3, 4, 5],
     *     [6]
     * ];
     *
     * _.pluck(lists, "length") // => [2, 3, 1]
     *
     * @memberof module:lamb
     * @category Array
     * @param {ArrayLike} arrayLike
     * @param {String} key
     * @returns {Array}
     */
    function pluck (arrayLike, key) {
        return map(arrayLike, getKey(key));
    }
    
    /**
     * Generates a function to sort arrays of complex values.
     * @example
     * var weights = ["2 Kg", "10 Kg", "1 Kg", "7 Kg"];
     * var asNumbers = _.sorter(_.sorter.ascending, parseFloat);
     *
     * weights.sort() // => ["1 Kg", "10 Kg", "2 Kg", "7 Kg"]
     * weights.sort(asNumbers) // => ["1 Kg", "2 Kg", "7 Kg", "10 Kg"]
     *
     * @memberof module:lamb
     * @category Array
     * @property {Function} ascending - A default ascending comparer.
     * @property {Function} descending - A default descending comparer.
     * @param {Function} comparer - A comparer function to be passed to the [Array.prototype.sort]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort} method.
     * @param {Function} reader - A function meant to generate a simple value from a complex one. The function should evaluate the array element and supply the value to be passed to the comparer.
     * @returns {Function}
     */
    function sorter (comparer, reader) {
        return function (a, b) {
            return comparer(reader(a), reader(b));
        };
    }
    sorter.ascending = function (a, b) {
        return a < b ? -1 : a > b ? 1 : 0;
    };
    sorter.descending = function (a, b) {
        return b < a ? -1 : b > a ? 1 : 0;
    };
    
    /**
     * Retrieves the first <code>n</code> elements from an array or array-like object.
     * Note that, being this a partial application of {@link module:lamb.slice|slice},
     * <code>n</code> can be a negative number.
     * @example
     * var arr = [1, 2, 3, 4, 5];
     *
     * _.take(arr, 3) // => [1, 2, 3]
     * _.take(arr, -1) // => [1, 2, 3, 4]
     * _.take(arr, -10) // => []
     *
     * @memberof module:lamb
     * @category Array
     * @function
     * @param {ArrayLike} arrayLike
     * @param {Number} n
     * @returns {Array}
     */
    var take = partial(slice, _, 0, _);
    
    /**
     * A curried version of {@link module:lamb.take|take} that expects the number of elements
     * to retrieve to build a function waiting for the list to take the elements from.
     * See the note and examples for {@link module:lamb.take|take} about passing a negative <code>n</code>.
     * @example
     * var take2 = _.takeN(2);
     *
     * take2([1, 2, 3, 4, 5]) // => [1, 2]
     *
     * @memberof module:lamb
     * @category Array
     * @function
     * @param {Number} n
     * @returns {Function}
     */
    var takeN = _curry(take, 2, true);
    
    /**
     * Builds a function that takes the first <code>n</code> elements satisfying a predicate from an array or array-like object.
     * @example
     * var isEven = function (n) { return n % 2 === 0; };
     * var takeWhileIsEven = _.takeWhile(isEven);
     *
     * takeWhileIsEven([1, 2, 4, 6, 8]) // => []
     * takeWhileIsEven([2, 4, 7, 8]) // => [2, 4]
     *
     * @memberof module:lamb
     * @category Array
     * @param {ListIteratorCallback} predicate
     * @param {Object} predicateContext
     * @returns {Function}
     */
    function takeWhile (predicate, predicateContext) {
        return function (arrayLike) {
            return slice(arrayLike, 0, _findSliceEndIndex(arrayLike, predicate, predicateContext));
        };
    }
    
    /**
     * Returns a list of every unique element present in the given arrays.
     * @example
     * _.union([1, 2, 3, 2], [3, 4], [1, 5]) // => [1, 2, 3, 4, 5]
     *
     * @memberof module:lamb
     * @category Array
     * @function
     * @param {...Array} array
     * @returns {Array}
     */
    var union = compose(uniques, _concat);
    
    /**
     * Returns an array comprised of the unique elements of the given array-like object.
     * Can work with lists of complex objects if supplied with an iteratee.
     * @example <caption>with simple values</caption>
     * _.uniques([1, 2, 2, 3, 4, 3, 5, 1]) // => [1, 2, 3, 4, 5]
     *
     * @example <caption>with complex values</caption>
     * var data  = [
     *     {id: "1"},
     *     {id: "4"},
     *     {id: "5"},
     *     {id: "1"},
     *     {id: "5"},
     * ];
     *
     * _.uniques(data, _.getKey("id")) // => [{id: "1"}, {id: "4"}, {"id": 5}]
     *
     * @memberof module:lamb
     * @category Array
     * @param {ArrayLike} arrayLike
     * @param {ListIteratorCallback} [iteratee] Defaults to the [identity function]{@link module:lamb.identity}.
     * @param {Object} [iterateeContext]
     * @returns {Array}
     */
    function uniques (arrayLike, iteratee, iterateeContext) {
        if (typeof iteratee !== "function") {
            iteratee = identity;
        }
    
        var result = [];
        var seen = [];
        var value;
    
        for (var i = 0; i < arrayLike.length; i++) {
            value = iteratee.call(iterateeContext, arrayLike[i], i , arrayLike);
    
            if (seen.indexOf(value) === -1) {
                seen.push(value);
                result.push(arrayLike[i]);
            }
        }
    
        return result;
    }
    
    lamb.difference = difference;
    lamb.drop = drop;
    lamb.dropN = dropN;
    lamb.dropWhile = dropWhile;
    lamb.find = find;
    lamb.findIndex = findIndex;
    lamb.flatMap = flatMap;
    lamb.flatten = flatten;
    lamb.group = group;
    lamb.groupBy = groupBy;
    lamb.intersection = intersection;
    lamb.insert = insert;
    lamb.list = list;
    lamb.mapWith = mapWith;
    lamb.pluck = pluck;
    lamb.sorter = sorter;
    lamb.take = take;
    lamb.takeN = takeN;
    lamb.takeWhile = takeWhile;
    lamb.union = union;
    lamb.uniques = uniques;
    
    
    function _currier (fn, arity, isRightCurry, slicer, argsHolder) {
        return function () {
            var args = argsHolder.concat(slicer(arguments));
    
            if (args.length >= arity) {
                return fn.apply(this, isRightCurry ? args.reverse() : args);
            } else {
                return _currier(fn, arity, isRightCurry, slicer, args);
            }
        };
    }
    
    function _curry (fn, arity, isRightCurry, isAutoCurry) {
        var slicer = isAutoCurry ? slice : function (a) {
            return a.length ? [a[0]] : [];
        };
    
        if ((arity | 0) !== arity) {
            arity = fn.length;
        }
    
        return _currier(fn, arity, isRightCurry, slicer, []);
    }
    
    /**
     * Applies the passed function to the given argument list.
     * @example
     * _.apply(_.add, [3, 4]) // => 7
     *
     * @memberof module:lamb
     * @category Function
     * @param {Function} fn
     * @param {ArrayLike} args
     * @returns {*}
     */
    function apply (fn, args) {
        return fn.apply(fn, slice(args));
    }
    
    /**
     * A curried version of {@link module:lamb.apply|apply}. Expects an array-like object to use as arguments
     * and builds a function waiting for the target of the application.
     * @example
     * var data = [3, 4];
     * var applyDataTo = _.applyArgs(data);
     *
     * applyDataTo(_.add) // => 7
     * applyDataTo(_.multiply) // => 12
     *
     * @memberof module:lamb
     * @category Function
     * @function
     * @param {ArrayLike} args
     * @returns {Function}
     */
    var applyArgs = _curry(apply, 2, true);
    
    /**
     * Builds a function that passes only the specified amount of arguments to the given function.
     * @example
     * var data = ["1-2", "13-5", "6-23"];
     * var getDashIndex = _.invoker("indexOf", "-");
     *
     * data.map(getDashIndex) // => [1, 2, -1]
     * data.map(_.aritize(getDashIndex, 1)) // = > [1, 2, 1]
     *
     * @memberof module:lamb
     * @category Function
     * @param {Function} fn
     * @param {Number} arity
     * @returns {Function}
     */
    function aritize (fn, arity) {
        return function () {
            return apply(fn, slice(arguments, 0, arity));
        };
    }
    
    /**
     * Transforms the evaluation of the given function in the evaluation of a sequence of functions expecting
     * only one argument. Each function of the sequence is a partial application of the original one, which
     * will be applied when the specified (or derived) arity is consumed.<br/>
     * See also {@link module:lamb.curryable|curryable} and {@link module:lamb.partial|partial}.
     * @example
     * var multiplyBy = _.curry(_.multiply);
     * var multiplyBy10 = multiplyBy(10);
     * var divideBy = _.curry(_.divide, 2, true);
     * var halve = divideBy(2);
     *
     * multiplyBy10(5) // => 50
     * multiplyBy10()(5) // => 50
     * multiplyBy10()()(2) // => 20
     * halve(3) // => 1.5
     * halve(3, 7) // => 1.5
     *
     * @memberof module:lamb
     * @category Function
     * @param {Function} fn
     * @param {?Number} [arity=fn.length]
     * @param {Boolean} [isRightCurry=false] - Whether to start currying from the rightmost argument or not.
     * @returns {Function}
     */
    function curry (fn, arity, isRightCurry) {
        return _curry(fn, arity, isRightCurry);
    }
    
    /**
     * Builds an auto-curried function. The resulting function can be called multiple times with
     * any number of arguments, and the original function will be applied only when the specified
     * (or derived) arity is consumed.<br/>
     * Note that you can pass undefined values as arguments explicitly, if you are so inclined, but empty
     * calls doesn't consume the arity.<br/>
     * See also {@link module:lamb.curry|curry} and {@link module:lamb.partial|partial}.
     * @example
     * var collectFourElements = _.curryable(_.list, 4);
     *
     * collectFourElements(2)(3)(4)(5) // => [2, 3, 4, 5]
     * collectFourElements(2)(3, 4)(5) // => [2, 3, 4, 5]
     * collectFourElements(2, 3, 4, 5) // => [2, 3, 4, 5]
     * collectFourElements()(2)()(3, 4, 5) // => [2, 3, 4, 5]
     *
     * @memberof module:lamb
     * @category Function
     * @param {Function} fn
     * @param {?Number} [arity=fn.length]
     * @param {Boolean} [isRightCurry=false] - Whether to start currying from the rightmost argument or not.
     * @returns {Function}
     */
    function curryable (fn, arity, isRightCurry) {
        return _curry(fn, arity, isRightCurry, true);
    }
    
    /**
     * Returns a function that will execute the given function only if it stops being called for the specified timespan.<br/>
     * See also {@link module:lamb.throttle|throttle} for a different behaviour where the first call happens immediately.
     * @example <caption>A common use case of <code>debounce</code> in a browser environment</caption>
     * var updateLayout = function () {
     *     // some heavy DOM operations here
     * };
     *
     * window.addEventListener("resize", _.debounce(updateLayout, 200), false);
     *
     * // The resize event is fired repeteadly until the user stops resizing the
     * // window, while the `updateLayout` function is called only once: 200 ms
     * // after he stopped.
     *
     * @memberof module:lamb
     * @category Function
     * @param {Function} fn
     * @param {Number} timespan - Expressed in milliseconds
     * @returns {Function}
     */
    function debounce (fn, timespan) {
        var timeoutID;
    
        return function () {
            var context = this;
            var args = arguments;
            var debounced = function () {
                timeoutID = null;
                fn.apply(context, args);
            };
    
            clearTimeout(timeoutID);
            timeoutID = setTimeout(debounced, timespan);
        };
    }
    
    /**
     * Returns a function that applies its arguments to the original function in reverse order.
     * @example
     * _.list(1, 2, 3) // => [1, 2, 3]
     * _.flip(_.list)(1, 2, 3) // => [3, 2, 1]
     *
     * @memberof module:lamb
     * @category Function
     * @param {Function} fn
     * @returns {Function}
     */
    function flip (fn) {
        return function () {
            var args = slice(arguments).reverse();
            return fn.apply(this, args);
        };
    }
    
    /**
     * Builds a function that will invoke the given method name on any received object and return
     * the result. If no method with such name is found the function will return <code>undefined</code>.
     * Along with the method name it's possible to supply some arguments that will be bound to the method call.<br/>
     * Further arguments can also be passed when the function is actually called, and they will be concatenated
     * to the bound ones.<br/>
     * If different objects share a method name it's possible to build polymorphic functions as you can see in
     * the example below.<br/>
     * {@link module:lamb.condition|Condition} can be used to wrap <code>invoker</code> to avoid this behaviour
     * by adding a predicate, while {@link module:lamb.adapter|adapter} can build more complex polymorphic functions
     * without the need of homonymy.<br/>
     * Returning <code>undefined</code> or checking for such value is meant to favor composition and interoperability
     * between the aforementioned functions: for a more standard behaviour see also {@link module:lamb.generic|generic}.
     * @example <caption>Basic polymorphism with <code>invoker</code></caption>
     * var polySlice = _.invoker("slice");
     *
     * polySlice([1, 2, 3, 4, 5], 1, 3) // => [2, 3]
     * polySlice("Hello world", 1, 3) // => "el"
     *
     * @example <caption>With bound arguments</caption>
     * var substrFrom2 = _.invoker("substr", 2);
     * substrFrom2("Hello world") // => "llo world"
     * substrFrom2("Hello world", 5) // => "llo w"
     *
     * @memberof module:lamb
     * @category Function
     * @param {String} methodName
     * @param {...*} [boundArg]
     * @returns {Function}
     */
    function invoker (methodName) {
        var boundArgs = slice(arguments, 1);
    
        return function (target) {
            var args = slice(arguments, 1);
            var method = target[methodName];
            return typeOf(method) === "Function" ? method.apply(target, boundArgs.concat(args)) : void 0;
        };
    }
    
    /**
     * Builds a function that allows to map over the received arguments before applying them to the original one.
     * @example
     * var sumArray = _.invoker("reduce", _.add);
     * var sum = _.compose(sumArray, _.list);
     *
     * sum(1, 2, 3, 4, 5) // => 15
     *
     * var square = _.partial(Math.pow, _, 2);
     * var sumSquares = _.mapArgs(sum, square);
     *
     * sumSquares(1, 2, 3, 4, 5) // => 55
     *
     * @memberof module:lamb
     * @category Function
     * @param {Function} fn
     * @param {ListIteratorCallback} mapper
     * @returns {Function}
     */
    function mapArgs (fn, mapper) {
        return compose(partial(apply, fn), mapWith(mapper), list);
    }
    
    /**
     * Creates a pipeline of functions, where each function consumes the result of the previous one.<br/>
     * See also {@link module:lamb.compose|compose}.
     * @example
     * var square = _.partial(Math.pow, _, 2);
     * var getMaxAndSquare = _.pipe(Math.max, square);
     *
     * getMaxAndSquare(3, 5) // => 25
     *
     * @memberof module:lamb
     * @category Function
     * @function
     * @param {...Function} fn
     * @returns {Function}
     */
    var pipe = flip(compose);
    
    /**
     * Builds a function that allows to "tap" into the arguments of the original one.
     * This allows to extract simple values from complex ones, transform arguments or simply intercept them.
     * If a "tapper" isn't found the argument is passed as it is.
     * @example
     * var someObject = {count: 5};
     * var someArrayData = [2, 3, 123, 5, 6, 7, 54, 65, 76, 0];
     * var getDataAmount = _.tapArgs(_.add, _.getKey("count"), _.getKey("length"));
     *
     * getDataAmount(someObject, someArrayData); // => 15
     *
     * @memberof module:lamb
     * @category Function
     * @param {Function} fn
     * @param {...?Function} [tapper]
     * @returns {Function}
     */
    function tapArgs (fn) {
        var readers = slice(arguments, 1);
    
        return function () {
            var len = arguments.length;
            var args = [];
    
            for (var i = 0; i < len; i++) {
                args.push(readers[i] ? readers[i](arguments[i]) : arguments[i]);
            }
    
            return fn.apply(this, args);
        };
    }
    
    /**
     * Returns a function that will invoke the passed function at most once in the given timespan.<br/>
     * The first call in this case happens as soon as the function is invoked; see also {@link module:lamb.debounce|debounce}
     * for a different behaviour where the first call is delayed.
     * @example
     * var log = _.throttle(console.log.bind(console), 5000);
     *
     * log("Hi"); // console logs "Hi"
     * log("Hi again"); // nothing happens
     * // after five seconds
     * log("Hello world"); // console logs "Hello world"
     *
     * @memberof module:lamb
     * @category Function
     * @param {Function} fn
     * @param {Number} timespan - Expressed in milliseconds.
     * @returns {Function}
     */
    function throttle (fn, timespan) {
        var result;
        var lastCall = 0;
    
        return function () {
            var now = Date.now();
    
            if (now - lastCall >= timespan) {
                lastCall = now;
                result = fn.apply(this, arguments);
            }
    
            return result;
        };
    }
    
    /**
     * Wraps the function <code>fn</code> inside a <code>wrapper</code> function.<br/>
     * This allows to conditionally execute <code>fn</code>, to tamper with its arguments or return value
     * and to run code before and after its execution.<br/>
     * Being this nothing more than a "{@link module:lamb.flip|flipped}" [partial application]{@link module:lamb.partial},
     * you can also easily build new functions from existent ones.
     * @example
     * var arrayMax = _.wrap(Math.max, _.apply);
     *
     * arrayMax([4, 5, 2, 6, 1]) // => 6
     *
     * @memberof module:lamb
     * @category Function
     * @function
     * @param {Function} fn
     * @param {Function} wrapper
     * @returns {Function}
     */
    var wrap = aritize(flip(partial), 2);
    
    lamb.apply = apply;
    lamb.applyArgs = applyArgs;
    lamb.aritize = aritize;
    lamb.curry = curry;
    lamb.curryable = curryable;
    lamb.debounce = debounce;
    lamb.flip = flip;
    lamb.invoker = invoker;
    lamb.mapArgs = mapArgs;
    lamb.pipe = pipe;
    lamb.tapArgs = tapArgs;
    lamb.throttle = throttle;
    lamb.wrap = wrap;
    
    
    /**
     * Accepts a series of functions and builds a function that applies the received arguments to each one and
     * returns the first non <code>undefined</code> value.<br/>
     * Meant to work in sinergy with {@link module:lamb.condition|condition} and {@link module:lamb.invoker|invoker},
     * can be useful as a strategy pattern for functions, to mimic conditional logic and also to build polymorphic functions.
     * @example
     * var isEven = function (n) { return n % 2 === 0; };
     * var filterString = _.condition(
     *     _.isType("String"),
     *     _.compose(_.invoker("join", ""), _.filter)
     * );
     * var filterAdapter = _.adapter(_.invoker("filter"), filterString);
     *
     * filterAdapter([1, 2, 3, 4, 5, 6], isEven)) // => [2, 4, 6]
     * filterAdapter("123456", isEven)) // => "246"
     * filterAdapter({}, isEven)) // => undefined
     *
     * // obviously it's composable
     * var filterWithDefault = _.adapter(filterAdapter, _.always("Not implemented"));
     *
     * filterWithDefault([1, 2, 3, 4, 5, 6], isEven)) // => [2, 4, 6]
     * filterWithDefault("123456", isEven)) // => "246"
     * filterWithDefault({}, isEven)) // => "Not implemented"
     *
     * @memberof module:lamb
     * @category Logic
     * @param {...Function} fn
     * @returns {Function}
     */
    function adapter () {
        var functions = slice(arguments);
    
        return function () {
            var len = functions.length;
            var result;
    
            for (var i = 0; i < len; i++) {
                result = apply(functions[i], arguments);
    
                if (!isUndefined(result)) {
                    break;
                }
            }
    
            return result;
        };
    }
    
    /**
     * Builds a predicate that returns true if all the given predicates are satisfied.
     * The arguments passed to the resulting function are applied to every predicate unless one of them returns false.
     * @example
     * var isEven = function (n) { return n % 2 === 0; };
     * var isPositive = function (n) { return n > 0; };
     * var isPositiveEven = _.allOf(isEven, isPositive);
     *
     * isPositiveEven(-2) // => false
     * isPositiveEven(11) // => false
     * isPositiveEven(6) // => true
     *
     * @memberof module:lamb
     * @category Logic
     * @param {...Function} predicate
     * @returns {Function}
     */
    function allOf () {
        var predicates = slice(arguments);
    
        return function () {
            var args = arguments;
    
            return predicates.every(function (predicate) {
                return predicate.apply(null, args);
            });
        };
    }
    
    /**
     * Builds a predicate that returns true if at least one of the given predicates is satisfied.
     * The arguments passed to the resulting function are applied to every predicate until one of them returns true.
     * @example
     * // Lamb's "isNil" is actually implemented like this
     * var isNil = _.anyOf(_.isNull, _.isUndefined);
     *
     * isNil(NaN) // => false
     * isNil({}) // => false
     * isNil(null) // => true
     * isNil(void 0) // => true
     * isNil() // => true
     *
     * @memberof module:lamb
     * @category Logic
     * @param {...Function} predicate
     * @returns {Function}
     */
    function anyOf () {
        var predicates = slice(arguments);
    
        return function () {
            var args = arguments;
    
            return predicates.some(function (predicate) {
                return predicate.apply(null, args);
            });
        };
    }
    
    /**
     * Builds a function that will apply the received arguments to <code>trueFn</code>, if the predicate is satisfied with
     * the same arguments, or to <code>falseFn</code> otherwise.<br/>
     * If <code>falseFn</code> isn't provided and the predicate isn't satisfied the function will return <code>undefined</code>.<br/>
     * Although you can use other <code>condition</code>s as <code>trueFn</code> or <code>falseFn</code>, it's probably better to
     * use {@link module:lamb.adapter|adapter} to build more complex behaviours.
     * @example
     * var isEven = function (n) { return n % 2 === 0};
     * var halve = function (n) { return n / 2; };
     * var halveIfEven = _.condition(isEven, halve, _.identity);
     *
     * halveIfEven(5) // => 5
     * halveIfEven(6) // => 3
     *
     * @memberof module:lamb
     * @category Logic
     * @see {@link module:lamb.invoker|invoker}
     * @param {Function} predicate
     * @param {Function} trueFn
     * @param {Function} [falseFn]
     * @returns {Function}
     */
    function condition (predicate, trueFn, falseFn) {
        return function () {
            var applyArgsTo = applyArgs(arguments);
            return applyArgsTo(predicate) ? applyArgsTo(trueFn) : falseFn ? applyArgsTo(falseFn) : void 0;
        };
    }
    
    /**
     * Verifies that the two supplied values are the same value using strict
     * equality. Note that this doesn't behave as the strict equality operator,
     * but rather as a shim of ES6's [Object.is]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is}.
     * Differences are that <code>0</code> and <code>-0</code> aren't the same value and, finally, <code>NaN</code> is equal to itself.
     * @example
     * var testObject = {};
     *
     * _.is({}, testObject) // => false
     * _.is(testObject, testObject) // => true
     * _.is("foo", "foo") // => true
     * _.is(0, -0) // => false
     * _.is(0 / 0, NaN) => true
     *
     * @memberof module:lamb
     * @category Logic
     * @param {*} a
     * @param {*} b
     * @returns {Boolean}
     */
    function is (a, b) {
        var result;
    
        if (a === 0 && b === 0) {
            result = 1 / a === 1 / b;
        } else if (a !== a) {
            result = b !== b;
        } else {
            result = a === b;
        }
    
        return result;
    }
    
    /**
     * Verifies that the first given value is greater than the second.
     * @example
     * var pastDate = new Date(2010, 2, 12);
     * var today = new Date();
     *
     * _.isGT(today, pastDate) // true
     * _.isGT(pastDate, today) // false
     * _.isGT(3, 4) // false
     * _.isGT(3, 3) // false
     * _.isGT(3, 2) // true
     * _.isGT(0, -0) // false
     * _.isGT(-0, 0) // false
     * _.isGT("a", "A") // true
     * _.isGT("b", "a") // true
     *
     * @memberof module:lamb
     * @category Logic
     * @param {Number|String|Date|Boolean} a
     * @param {Number|String|Date|Boolean} b
     * @returns {Boolean}
     */
    function isGT (a, b) {
        return a > b;
    }
    
    /**
     * Verifies that the first given value is greater than or equal to the second.
     * Regarding equality, beware that this is simply a wrapper for the native operator, so <code>-0 === 0</code>.
     * @example
     * _.isGTE(3, 4) // false
     * _.isGTE(3, 3) // true
     * _.isGTE(3, 2) // true
     * _.isGTE(0, -0) // true
     * _.isGTE(-0, 0) // true
     *
     * @memberof module:lamb
     * @category Logic
     * @param {Number|String|Date|Boolean} a
     * @param {Number|String|Date|Boolean} b
     * @returns {Boolean}
     */
    function isGTE (a, b) {
        return a >= b;
    }
    
    /**
     * Verifies that the first given value is less than the second.
     * @example
     * var pastDate = new Date(2010, 2, 12);
     * var today = new Date();
     *
     * _.isLT(today, pastDate) // false
     * _.isLT(pastDate, today) // true
     * _.isLT(3, 4) // true
     * _.isLT(3, 3) // false
     * _.isLT(3, 2) // false
     * _.isLT(0, -0) // false
     * _.isLT(-0, 0) // false
     * _.isLT("a", "A") // false
     * _.isLT("a", "b") // true
     *
     * @memberof module:lamb
     * @category Logic
     * @param {Number|String|Date|Boolean} a
     * @param {Number|String|Date|Boolean} b
     * @returns {Boolean}
     */
    function isLT (a, b) {
        return a < b;
    }
    
    /**
     * Verifies that the first given value is less than or equal to the second.
     * Regarding equality, beware that this is simply a wrapper for the native operator, so <code>-0 === 0</code>.
     * @example
     * _.isLTE(3, 4) // true
     * _.isLTE(3, 3) // true
     * _.isLTE(3, 2) // false
     * _.isLTE(0, -0) // true
     * _.isLTE(-0, 0) // true
     *
     * @memberof module:lamb
     * @category Logic
     * @param {Number|String|Date|Boolean} a
     * @param {Number|String|Date|Boolean} b
     * @returns {Boolean}
     */
    function isLTE (a, b) {
        return a <= b;
    }
    
    /**
     * A simple negation of {@link module:lamb.is|is}, exposed for convenience.
     * @example
     * _.isNot("foo", "foo") // => false
     * _.isNot(0, -0) // => true
     *
     * @memberof module:lamb
     * @category Logic
     * @function
     * @param {*} valueA
     * @param {*} valueB
     * @returns {Boolean}
     */
    var isNot = not(is);
    
    /**
     * Returns a predicate that negates the given one.
     * @example
     * var isEven = function (n) { return n % 2 === 0; };
     * var isOdd = _.not(isEven);
     *
     * isOdd(5) // => true
     * isOdd(4) // => false
     *
     * @memberof module:lamb
     * @category Logic
     * @param {Function} predicate
     * @returns {Function}
     */
    function not (predicate) {
        return function () {
            return !predicate.apply(null, arguments);
        };
    }
    
    lamb.adapter = adapter;
    lamb.allOf = allOf;
    lamb.anyOf = anyOf;
    lamb.condition = condition;
    lamb.is = is;
    lamb.isGT = isGT;
    lamb.isGTE = isGTE;
    lamb.isLT = isLT;
    lamb.isLTE = isLTE;
    lamb.isNot = isNot;
    lamb.not = not;
    
    
    /**
     * Adds two numbers.
     * @example
     * _.add(4, 5) // => 9
     *
     * @memberof module:lamb
     * @category Math
     * @param {Number} a
     * @param {Number} b
     * @returns {Number}
     */
    function add (a, b) {
        return a + b;
    }
    
    /**
     * Divides two numbers.
     * @example
     * _.divide(5, 2) // => 2.5
     *
     * @memberof module:lamb
     * @category Math
     * @param {Number} a
     * @param {Number} b
     * @returns {Number}
     */
    function divide (a, b) {
        return a / b;
    }
    
    /**
     * Performs the modulo operation and should not be confused with the {@link module:lamb.remainder|remainder}.
     * The function performs a floored division to calculate the result and not a truncated one, hence the sign of
     * the dividend is not kept, unlike the {@link module:lamb.remainder|remainder}.
     * @example
     * _.modulo(5, 3) // => 2
     * _.remainder(5, 3) // => 2
     *
     * _.modulo(-5, 3) // => 1
     * _.remainder(-5, 3) // => -2
     *
     * @memberof module:lamb
     * @category Math
     * @see {@link http://en.wikipedia.org/wiki/Modulo_operation}
     * @param {Number} a
     * @param {Number} b
     * @returns {Number}
     */
    function modulo (a, b) {
        return a - (b * Math.floor(a / b));
    }
    
    /**
     * Multiplies two numbers.
     * @example
     * _.multiply(5, 3) // => 15
     *
     * @memberof module:lamb
     * @category Math
     * @param {Number} a
     * @param {Number} b
     * @returns {Number}
     */
    function multiply (a, b) {
        return a * b;
    }
    
    /**
     * Generates a random integer between two given integers, both included.
     * Note that no safety measure is taken if the provided arguments aren't integers, so
     * you may end up with unexpected (not really) results.
     * For example <code>randomInt(0.1, 1.2)</code> could be <code>2</code>.
     * @example
     *
     * _.randomInt(1, 10) // => an integer >=1 && <= 10
     *
     * @memberof module:lamb
     * @category Math
     * @param {Number} min
     * @param {Number} max
     * @returns {Number}
     */
    function randomInt (min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
    
    /**
     * Generates an arithmetic progression of numbers starting from <code>start</code> up to,
     * but not including, <code>limit</code>, using the given <code>step</code>.
     * @example
     * _.range(2, 10) // => [2, 3, 4, 5, 6, 7, 8, 9]
     * _.range(2, 10, 0) // => [2]
     * _.range(1, -10, -2) // => [1, -1, -3, -5, -7, -9]
     * _.range(1, -10, 2) // => [1]
     *
     * @memberof module:lamb
     * @category Math
     * @param {Number} start
     * @param {Number} limit
     * @param {Number} [step=1]
     * @returns {Number[]}
     */
    function range (start, limit, step) {
        if (step === 0 || arguments.length < 2) {
            return [start];
        }
    
        if (!step) {
            step = 1;
        }
    
        var len = Math.max(Math.ceil((limit - start) / step), 0);
        return sequence(start, len, partial(add, step));
    }
    
    /**
     * Gets the remainder of the division of two numbers.
     * Not to be confused with the {@link module:lamb.modulo|modulo} as the remainder
     * keeps the sign of the dividend and may lead to some unexpected results.
     * @example
     * // example of wrong usage of the remainder
     * // (in this case the modulo operation should be used)
     * var isOdd = function (n) { return _.remainder(n, 2) === 1; };
     * isOdd(-3) // => false as -3 % 2 === -1
     *
     * @memberof module:lamb
     * @category Math
     * @see {@link http://en.wikipedia.org/wiki/Modulo_operation}
     * @param {Number} a
     * @param {Number} b
     * @returns {Number}
     */
    function remainder (a, b) {
        return a % b;
    }
    
    /**
     * Generates a sequence of values of the desired length with the provided iteratee.
     * The values being iterated, and received by the iteratee, are the results generated so far.
     * @example
     * var fibonacci = function (n, idx, list) {
     *     return n + (list[idx - 1] || 0);
     * };
     *
     * _.sequence(1, 10, fibonacci) // => [1, 1, 2, 3, 5, 8, 13, 21, 34, 55]
     *
     * @memberof module:lamb
     * @category Math
     * @param {*} start - The starting value
     * @param {Number} len - The desired length for the sequence
     * @param {ListIteratorCallback} iteratee
     * @param {Object} [iterateeContext]
     * @returns {Array}
     */
    function sequence (start, len, iteratee, iterateeContext) {
        var result = [start];
    
        for (var i = 0, limit = len - 1; i < limit; i++) {
            result.push(iteratee.call(iterateeContext, result[i], i, result));
        }
    
        return result;
    }
    
    /**
     * Subtracts two numbers.
     * @example
     * _.subtract(5, 3) // => 2
     *
     * @memberof module:lamb
     * @category Math
     * @param {Number} a
     * @param {Number} b
     * @returns {Number}
     */
    function subtract (a, b) {
        return a - b;
    }
    
    lamb.add = add;
    lamb.divide = divide;
    lamb.modulo = modulo;
    lamb.multiply = multiply;
    lamb.randomInt = randomInt;
    lamb.range = range;
    lamb.remainder = remainder;
    lamb.sequence = sequence;
    lamb.subtract = subtract;
    
    
    function _immutable (obj, seen) {
        if (seen.indexOf(obj) === -1) {
            seen.push(Object.freeze(obj));
    
            Object.getOwnPropertyNames(obj).forEach(function (key) {
                var value = obj[key];
    
                if (typeof value === "object" && !isNull(value)) {
                    _immutable(value, seen);
                }
            });
        }
    
        return obj;
    }
    
    /**
     * Builds a <code>checker</code> function meant to be used with {@link module:lamb.validate|validate}.<br/>
     * Note that the function accepts multiple <code>keyPaths</code> as a means to compare their values. In
     * other words all the received <code>keyPaths</code> will be passed as arguments to the <code>predicate</code>
     * to run the test.<br/>
     * If you want to run the same single property check with multiple properties, you should build
     * multiple <code>checker</code>s and combine them with {@link module:lamb.validate|validate}.
     * @example
     * var user = {
     *     name: "John",
     *     surname: "Doe",
     *     login: {
     *         username: "jdoe",
     *         password: "abc123",
     *         passwordConfirm: "abc123"
     *     }
     * };
     * var pwdMatch = _.checker(
     *     _.is,
     *     "Passwords don't match",
     *     ["login.password", "login.passwordConfirm"]
     * );
     *
     * pwdMatch(user) // => []
     *
     * user.login.passwordConfirm = "avc123";
     *
     * pwdMatch(user) // => ["Passwords don't match", ["login.password", "login.passwordConfirm"]]
     *
     * @memberof module:lamb
     * @category Object
     * @param {Function} predicate - The predicate to test the object properties
     * @param {String} message - The error message
     * @param {String[]} keyPaths - The array of property names, or {@link module:lamb.getWithPath|paths}, to test.
     * @param {String} [pathSeparator="."]
     * @returns {Array<String, String[]>} An error in the form <code>["message", ["propertyA", "propertyB"]]</code> or an empty array.
     */
    function checker (predicate, message, keyPaths, pathSeparator) {
        return function (obj) {
            var errors = [];
            var getValues = partial(getWithPath, obj, _, pathSeparator);
    
            return predicate.apply(obj, keyPaths.map(getValues)) ? [] : [message, keyPaths];
        };
    }
    
    /**
     * Builds an object from a list of key / value pairs like the one
     * returned by [pairs]{@link module:lamb.pairs}.<br/>
     * In case of duplicate keys the last key / value pair is used.
     * @example
     * _.fromPairs([["a", 1], ["b", 2], ["c", 3]]) // => {"a": 1, "b": 2, "c": 3}
     * _.fromPairs([["a", 1], ["b", 2], ["a", 3]]) // => {"a": 3, "b": 2}
     * _.fromPairs([[1], [void 0, 2], [null, 3]]) // => {"1": undefined, "undefined": 2, "null": 3}
     *
     * @memberof module:lamb
     * @category Object
     * @param {Array<Array<String, *>>} pairsList
     * @returns {Object}
     */
    function fromPairs (pairsList) {
        var result = {};
    
        pairsList.forEach(function (pair) {
            result[pair[0]] = pair[1];
        });
    
        return result;
    }
    
    /**
     * Returns the value of the object property with the given key.
     * @example
     * var user {name: "John"};
     *
     * _.get(user, "name") // => "John";
     * _.get(user, "surname") // => undefined
     *
     * @memberof module:lamb
     * @category Object
     * @param {Object} obj
     * @param {String} key
     * @returns {*}
     */
    function get (obj, key) {
        return obj[key];
    }
    
    /**
     * A curried version of {@link module:lamb.get|get}.<br/>
     * Receives a property name and builds a function expecting the object from which we want to retrieve the property.
     * @example
     * var user1 = {name: "john"};
     * var user2 = {name: "jane"};
     * var getName = _.getKey("name");
     *
     * getName(user1) // => "john"
     * getName(user2) // => "jane"
     *
     * @memberof module:lamb
     * @category Object
     * @function
     * @param {String} key
     * @returns {Function}
     */
    var getKey = _curry(get, 2, true);
    
    /**
     * Gets a nested property value from an object using the given path.<br/>
     * The path is a string with property names separated by dots by default, but
     * it can be customised with the optional third parameter.
     * @example
     * var user = {
     *     name: "John",
     *     surname: "Doe",
     *     login: {
     *         user.name: "jdoe",
     *         password: "abc123"
     *     }
     * };
     *
     * // same as _.get if no path is involved
     * _.getWithPath(user, "name") // => "John"
     *
     * _.getWithPath(user, "login.password") // => "abc123";
     * _.getWithPath(user, "login/user.name", "/") // => "jdoe"
     * _.getWithPath(user, "name.foo") // => undefined
     * _.getWithPath(user, "name.foo.bar") // => throws a TypeError
     *
     * @memberof module:lamb
     * @category Object
     * @param {Object|ArrayLike} obj
     * @param {String} path
     * @param {String} [separator="."]
     * @returns {*}
     */
    function getWithPath (obj, path, separator) {
        return path.split(separator || ".").reduce(get, obj);
    }
    
    /**
     * Verifies the existence of a property in an object.
     * @example
     * var user1 = {name: "john"};
     *
     * _.has(user1, "name") // => true
     * _.has(user1, "surname") // => false
     * _.has(user1, "toString") // => true
     *
     * var user2 = Object.create(null);
     *
     * // not inherited through the prototype chain
     * _.has(user2, "toString") // => false
     *
     * @memberof module:lamb
     * @category Object
     * @param {Object} obj
     * @param {String} key
     * @returns {Boolean}
     */
    function has (obj, key) {
        return key in obj;
    }
    
    /**
     * Curried version of {@link module:lamb.has|has}.<br/>
     * Returns a function expecting the object to check against the given key.
     * @example
     * var user1 = {name: "john"};
     * var user2 = {};
     * var hasName = _.hasKey("name");
     *
     * hasName(user1) // => true
     * hasName(user2) // => false
     *
     * @memberof module:lamb
     * @category Object
     * @function
     * @param {String} key
     * @returns {Function}
     */
    var hasKey = _curry(has, 2, true);
    
    /**
     * Builds a function expecting an object to check against the given key / value pair.
     * @example
     * var hasTheCorrectAnswer = _.hasKeyValue("answer", 42);
     *
     * hasTheCorrectAnswer({answer: 2}) // false
     * hasTheCorrectAnswer({answer: 42}) // true
     *
     * @memberof module:lamb
     * @category Object
     * @function
     * @param {String} key
     * @param {*} value
     * @returns {Function}
     */
    var hasKeyValue = function (key, value) {
        return compose(partial(is, value), getKey(key));
    };
    
    /**
     * Verifies if an object has the specified property and that the property isn't inherited through
     * the prototype chain.<br/>
     * @example <caption>Comparison with <code>has</code>.</caption>
     * var user = {name: "john"};
     *
     * _.has(user, "name") // => true
     * _.has(user, "surname") // => false
     * _.has(user, "toString") // => true
     *
     * _.hasOwn(user, "name") // => true
     * _.hasOwn(user, "surname") // => false
     * _.hasOwn(user, "toString") // => false
     *
     * @memberof module:lamb
     * @category Object
     * @function
     * @param {Object} obj
     * @param {String} key
     * @returns {Boolean}
     */
    var hasOwn = generic(_objectProto.hasOwnProperty);
    
    /**
     * Curried version of {@link module:lamb.hasOwn|hasOwn}.<br/>
     * Returns a function expecting the object to check against the given key.
     * @example
     * var user = {name: "john"};
     * var hasOwnName = _.hasOwnKey("name");
     * var hasOwnToString = _.hasOwnToString("toString");
     *
     * hasOwnName(user) // => true
     * hasOwnToString(user) // => false
     *
     * @memberof module:lamb
     * @category Object
     * @function
     * @param {String} key
     * @returns {Function}
     */
    var hasOwnKey = _curry(hasOwn, 2, true);
    
    /**
     * Makes an object immutable by recursively calling [Object.freeze]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze}
     * on its members.<br/>
     * Any attempt to extend or modify the object can throw a <code>TypeError</code> or fail silently,
     * depending on the environment and the [strict mode]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode} directive.
     * @example
     * var user = _.immutable({
     *     name: "John",
     *     surname: "Doe",
     *     login: {
     *         username: "jdoe",
     *         password: "abc123"
     *     },
     *     luckyNumbers: [13, 17]
     * });
     *
     * // Any of these statements will fail and possibly
     * // throw a TypeError (see the function description)
     * user.name = "Joe";
     * delete user.name;
     * user.newProperty = [];
     * user.login.password = "foo";
     * user.luckyNumbers.push(-13);
     *
     * @memberof module:lamb
     * @category Object
     * @param {Object} obj
     * @returns {Object}
     */
    function immutable (obj) {
        return _immutable(obj, []);
    }
    
    /**
     * Builds an object from the two given lists, using the first one as keys and the last one as values.<br/>
     * If the list of keys is longer than the values one, the keys will be created with <code>undefined</code> values.<br/>
     * If more values than keys are supplied, the extra values will be ignored.<br/>
     * See also [tear]{@link module:lamb.tear} for the reverse operation.
     * @example
     * _.make(["a", "b", "c"], [1, 2, 3]) // => {a: 1, b: 2, c: 3}
     * _.make(["a", "b", "c"], [1, 2]) // => {a: 1, b: 2, c: undefined}
     * _.make(["a", "b"], [1, 2, 3]) // => {a: 1, b: 2}
     * _.make([null, void 0, 2], [1, 2, 3]) // => {"null": 1, "undefined": 2, "2": 3}
     *
     * @memberof module:lamb
     * @category Object
     * @param {String[]} keys
     * @param {Array} values
     * @returns {Object}
     */
    function make (keys, values) {
        var result = {};
        var valuesLen = values.length;
    
        for (var i = 0, len = keys.length; i < len; i++) {
            result[keys[i]] = i < valuesLen ? values[i] : void 0;
        }
    
        return result;
    }
    
    /**
     * Converts an object into an array of key / value pairs of its enumerable properties.<br/>
     * See also [fromPairs]{@link module:lamb.fromPairs} for the reverse operation.
     * @example
     * _.pairs({a: 1, b: 2, c: 3}) // => [["a", 1], ["b", 2], ["c", 3]]
     *
     * @memberof module:lamb
     * @category Object
     * @param {Object} obj
     * @returns {Array<Array<String, *>>}
     */
    function pairs (obj) {
        var result = [];
    
        for (var prop in obj) {
            result.push([prop, obj[prop]]);
        }
    
        return result;
    }
    
    /**
     * Returns an object containing only the specified properties of the given object.<br/>
     * Non existent properties will be ignored.
     * @example
     * var user = {name: "john", surname: "doe", age: 30};
     *
     * _.pick(user, ["name", "age"]) // => {"name": "john", "age": 30};
     * _.pick(user, ["name", "email"]) // => {"name": "john"}
     *
     * @memberof module:lamb
     * @category Object
     * @param {Object} source
     * @param {String[]} whitelist
     * @returns {Object}
     */
    function pick (source, whitelist) {
        var result = {};
    
        whitelist.forEach(function (key) {
            if (key in source) {
                result[key] = source[key];
            }
        });
    
        return result;
    }
    
    /**
     * Builds a function expecting an object whose properties will be checked against the given predicate.<br/>
     * The properties satisfying the predicate will be included in the resulting object.
     * @example
     * var user = {name: "john", surname: "doe", age: 30};
     * var pickIfIstring = _.pickIf(_.isType("String"));
     *
     * pickIfIstring(user) // => {name: "john", surname: "doe"}
     *
     * @memberof module:lamb
     * @category Object
     * @param {ObjectIteratorCallback} predicate
     * @param {Object} [predicateContext]
     * @returns {Function}
     */
    function pickIf (predicate, predicateContext) {
        return function (source) {
            var result = {};
    
            for (var key in source) {
                if (predicate.call(predicateContext, source[key], key, source)) {
                    result[key] = source[key];
                }
            }
    
            return result;
        };
    }
    
    /**
     * Returns a copy of the source object without the specified properties.
     * @example
     * var user = {name: "john", surname: "doe", age: 30};
     *
     * _.skip(user, ["name", "age"]) // => {surname: "doe"};
     * _.skip(user, ["name", "email"]) // => {surname: "doe", age: 30};
     *
     * @memberof module:lamb
     * @category Object
     * @param {Object} source
     * @param {String[]} blacklist
     * @returns {Object}
     */
    function skip (source, blacklist) {
        var result = {};
    
        for (var key in source) {
            if (blacklist.indexOf(key) === -1) {
                result[key] = source[key];
            }
        }
    
        return result;
    }
    
    /**
     * Builds a function expecting an object whose properties will be checked against the given predicate.<br/>
     * The properties satisfying the predicate will be omitted in the resulting object.
     * @example
     * var user = {name: "john", surname: "doe", age: 30};
     * var skipIfIstring = _.skipIf(_.isType("String"));
     *
     * skipIfIstring(user) // => {age: 30}
     *
     * @memberof module:lamb
     * @category Object
     * @param {ObjectIteratorCallback} predicate
     * @param {Object} [predicateContext]
     * @returns {Function}
     */
    function skipIf (predicate, predicateContext) {
        return pickIf(not(predicate), predicateContext);
    }
    
    /**
     * Tears an object apart by transforming it in an array of two lists: one containing its enumerable keys,
     * the other containing the corresponding values.<br/>
     * Although this "tearing apart" may sound as a rather violent process, the source object will be unharmed.<br/>
     * See also [make]{@link module:lamb.make} for the reverse operation.
     * @example
     * _.tear({a: 1, b: 2, c: 3}) // => [["a", "b", "c"], [1, 2, 3]]
     *
     * @memberof module:lamb
     * @category Object
     * @param {Object} obj
     * @returns {Array<Array<String>, Array<*>>}
     */
    function tear (obj) {
        var keys = [];
        var values = [];
    
        for (var prop in obj) {
            keys.push(prop);
            values.push(obj[prop]);
        }
    
        return [keys, values];
    }
    
    /**
     * Validates an object with the given list of {@link module:lamb.checker|checker} functions.
     * @example
     * var hasContent = function (s) { return s.trim().length > 0; };
     * var isAdult = function (age) { return age >= 18; };
     * var userCheckers = [
     *     _.checker(hasContent, "Name is required", ["name"]),
     *     _.checker(hasContent, "Surname is required", ["surname"]),
     *     _.checker(isAdult, "Must be at least 18 years old", ["age"])
     * ];
     *
     * var user1 = {name: "john", surname: "doe", age: 30};
     * var user2 = {name: "jane", surname: "", age: 15};
     *
     * _.validate(user1, userCheckers) // => []
     * _.validate(user2, userCheckers) // => [["Surname is required", ["surname"]], ["Must be at least 18 years old", ["age"]]]
     *
     * @memberof module:lamb
     * @category Object
     * @param {Object} obj
     * @param {Function[]} checkers
     * @returns {Array<Array<String, String[]>>} An array of errors in the form returned by {@link module:lamb.checker|checker}, or an empty array.
     */
    function validate (obj, checkers) {
        return checkers.reduce(function (errors, checker) {
            var result = checker(obj);
            result.length && errors.push(result);
            return errors;
        }, []);
    }
    
    /**
     * A curried version of {@link module:lamb.validate|validate} accepting a list of {@link module:lamb.checker|checkers} and
     * returning a function expecting the object to validate.
     * @example
     * var hasContent = function (s) { return s.trim().length > 0; };
     * var isAdult = function (age) { return age >= 18; };
     * var userCheckers = [
     *     _.checker(hasContent, "Name is required", ["name"]),
     *     _.checker(hasContent, "Surname is required", ["surname"]),
     *     _.checker(isAdult, "Must be at least 18 years old", ["age"])
     * ];
     * var validateUser = _.validateWith(userCheckers);
     *
     * var user1 = {name: "john", surname: "doe", age: 30};
     * var user2 = {name: "jane", surname: "", age: 15};
     *
     * validateUser(user1) // => []
     * validateUser(user2) // => [["Surname is required", ["surname"]], ["Must be at least 18 years old", ["age"]]]
     *
     * @memberof module:lamb
     * @category Object
     * @function
     * @param {Function[]} checkers
     * @returns {Function}
     */
    var validateWith = _curry(validate, 2, true);
    
    /**
     * Generates an array with the values of the enumerable properties of the given object.
     * @example
     * var user = {name: "john", surname: "doe", age: 30};
     *
     * _.values(user) // => ["john", "doe", 30]
     *
     * @memberof module:lamb
     * @category Object
     * @param {Object} obj
     * @returns {Array}
     */
    function values (obj) {
        var result = [];
    
        for(var prop in obj) {
            result.push(obj[prop]);
        }
    
        return result;
    }
    
    lamb.checker = checker;
    lamb.fromPairs = fromPairs;
    lamb.get = get;
    lamb.getKey = getKey;
    lamb.getWithPath = getWithPath;
    lamb.has = has;
    lamb.hasKey = hasKey;
    lamb.hasKeyValue = hasKeyValue;
    lamb.hasOwn = hasOwn;
    lamb.hasOwnKey = hasOwnKey;
    lamb.immutable = immutable;
    lamb.make = make;
    lamb.pairs = pairs;
    lamb.pick = pick;
    lamb.pickIf = pickIf;
    lamb.skip = skip;
    lamb.skipIf = skipIf;
    lamb.tear = tear;
    lamb.validate = validate;
    lamb.validateWith = validateWith;
    lamb.values = values;
    
    
    function _getPadding (source, char, len) {
        return repeat(char[0] || " ", Math.ceil(len - source.length));
    }
    
    /**
     * Pads a string to the desired length with the given char starting from the beginning of the string.
     * @example
     * _.padLeft("foo", "-", 0) // => "foo"
     * _.padLeft("foo", "-", -1) // => "foo"
     * _.padLeft("foo", "-", 5) // => "--foo"
     * _.padLeft("foo", "-", 3) // => "foo"
     * _.padLeft("foo", "ab", 7) // => "aaaafoo"
     * _.padLeft("foo", "", 5) // => "  foo"
     * _.padLeft("", "-", 5) // => "-----"
     *
     * @memberof module:lamb
     * @category String
     * @param {String} source
     * @param {String} [char=" "] - The padding char. If a string is passed only the first char is used.
     * @param {Number} len
     * @returns {String}
     */
    function padLeft (source, char, len) {
        return _getPadding(source, char, len) + source;
    }
    
    /**
     * Pads a string to the desired length with the given char starting from the end of the string.
     * @example
     * _.padRight("foo", "-", 0) // => "foo"
     * _.padRight("foo", "-", -1) // => "foo"
     * _.padRight("foo", "-", 5) // => "foo--"
     * _.padRight("foo", "-", 3) // => "foo"
     * _.padRight("foo", "ab", 7) // => "fooaaaa"
     * _.padRight("foo", "", 5) // => "foo  "
     * _.padRight("", "-", 5) // => "-----"
     *
     * @memberof module:lamb
     * @category String
     * @param {String} source
     * @param {String} [char=" "] - The padding char. If a string is passed only the first char is used.
     * @param {Number} len
     * @returns {String}
     */
    function padRight (source, char, len) {
        return source + _getPadding(source, char, len);
    }
    
    /**
     * Builds a new string by repeating the source string the desired amount of times.<br/>
     * Note that unlike the current ES6 proposal for [String.prototype.repeat]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/repeat},
     * this function doesn't throw a RangeError if <code>count</code> is negative, but returns an empty string instead.
     * @example
     * _.repeat("Hello", -1) // => ""
     * _.repeat("Hello", 1) // => "Hello"
     * _.repeat("Hello", 3) // => "HelloHelloHello"
     *
     * @memberof module:lamb
     * @category String
     * @param {String} source
     * @param {Number} count
     * @returns {String}
     */
    function repeat (source, count) {
        var result = "";
    
        for (var i = 0; i < count; i++) {
            result += source;
        }
    
        return result;
    }
    
    /**
     * Builds a predicate expecting a string to test against the given regular expression pattern.
     * @example
     * var hasNumbersOnly = _.testWith(/^\d+$/);
     *
     * hasNumbersOnly("123") // => true
     * hasNumbersOnly("123 Kg") // => false
     *
     * @memberof module:lamb
     * @category String
     * @param {RegExp} pattern
     * @returns {Function}
     */
    function testWith (pattern) {
        return _reProto.test.bind(pattern);
    }
    
    lamb.padLeft = padLeft;
    lamb.padRight = padRight;
    lamb.repeat = repeat;
    lamb.testWith = testWith;
    
    
    /**
     * Verifies if a value is <code>null</code> or <code>undefined</code>.
     * @example
     * _.isNil(NaN) // => false
     * _.isNil({}) // => false
     * _.isNil(null) // => true
     * _.isNil(void 0) // => true
     * _.isNil() // => true
     *
     * @memberof module:lamb
     * @category Type
     * @function
     * @param {*} value
     * @returns {Boolean}
     */
    var isNil = anyOf(isNull, isUndefined);
    
    /**
     * Verifies if a value is <code>null</code>.
     * @example
     * _.isNull(null) // => true
     * _.isNull(void 0) // => false
     * _.isNull(false) // => false
     *
     * @memberof module:lamb
     * @category Type
     * @param {*} value
     * @returns {Boolean}
     */
    function isNull (value) {
        return value === null;
    }
    
    /**
     * Builds a predicate that expects a value to check against the specified type.
     * @example
     * var isString = _.isType("String");
     *
     * isString("Hello") // => true
     * isString(new String("Hi")) // => true
     *
     * @memberof module:lamb
     * @category Type
     * @param {String} type
     * @returns {Function}
     */
    function isType (type) {
        return function (value) {
            return typeOf(value) === type;
        };
    }
    
    /**
     * Verifies if a value is <code>undefined</code>.
     * @example
     * _.isUndefined(null) // => false
     * _.isUndefined(void 0) // => true
     * _.isUndefined(false) // => false
     *
     * @memberof module:lamb
     * @category Type
     * @param {*} value
     * @returns {Boolean}
     */
    function isUndefined (value) {
        // using void because undefined could be theoretically shadowed
        return value === void 0;
    }
    
    /**
     * Retrieves the "type tag" from the given value.
     * @example
     * _.typeOf(Object.prototype.toString) // => "Function"
     * _.typeOf(/a/) // => "RegExp"
     *
     * @memberof module:lamb
     * @category Type
     * @param {*} value
     * @returns {String}
     */
    function typeOf (value) {
        return _objectProto.toString.call(value).replace(/^\[\w+\s+|\]$/g, "");
    }
    
    lamb.isNil = isNil;
    lamb.isNull = isNull;
    lamb.isType = isType;
    lamb.isUndefined = isUndefined;
    lamb.typeOf = typeOf;
    
    /* istanbul ignore next */
    if (typeof exports === "object") {
        module.exports = lamb;
    } else if (typeof define === "function" && define.amd) {
        define(function() { return lamb; });
    } else {
        host.lamb = lamb;
    }
}(this);

/**
 * @callback AccumulatorCallback
 * @global
 * @param {*} previousValue The value returned it the last execution of the accumulator or, in the first iteration, the {@link module:lamb.reduce|initialValue} if supplied.
 * @param {*} currentValue The value being processed in the current iteration.
 * @param {Number} idx - The index of the element being processed.
 * @param {ArrayLike} arrayLike - The list being traversed.
 */

/**
 * The built-in arguments object.
 * @typedef {arguments} arguments
 * @global
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/arguments|arguments} in Mozilla documentation.
 */

/**
 * The built-in Array object.
 * @typedef {Array} Array
 * @global
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array|Array} in Mozilla documentation.
 */

/**
 * Any array-like object.
 * @typedef {Array|String|arguments|?} ArrayLike
 * @global
 */

/**
 * The built-in Boolean object.
 * @typedef {Boolean} Boolean
 * @global
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean|Boolean} in Mozilla documentation.
 */

/**
 * The built-in Date object.
 * @typedef {Date} Date
 * @global
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date|Date} in Mozilla documentation.
 */

/**
 * The built-in Function object.
 * @typedef {Function} function
 * @global
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function|Function} and
 *      {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions|Functions} in Mozilla documentation.
 */

/**
 * @callback ListIteratorCallback
 * @global
 * @param {*} element - The element being evaluated.
 * @param {Number} idx - The index of the element within the list.
 * @param {ArrayLike} arrayLike - The list being traversed.
 */

/**
 * The built-in Number object.
 * @typedef {Number} Number
 * @global
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number|Number} in Mozilla documentation.
 */

/**
 * The built-in Object object.
 * @typedef {Object} Object
 * @global
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object|Object} in Mozilla documentation.
 */

/**
 * @callback ObjectIteratorCallback
 * @global
 * @param {*} value - The value of the current property.
 * @param {String} key - The property name.
 * @param {Object} source - The object being traversed.
 */

/**
 * The built-in RegExp object.
 * @typedef {RegExp} RegExp
 * @global
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp|RegExp} in Mozilla documentation.
 */

/**
 * The built-in String object.
 * @typedef {String} String
 * @global
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String|String} in Mozilla documentation.
 */
