;( function( global, factory ) {
	if ( typeof module === "object" && typeof module.exports === "object" ) {
		module.exports = factory();
	} else if ( typeof define === "function" ) {
		define('en', factory);
	} else if ( typeof global === 'object' ) {
		global.kit = factory();
	} else {
		throw new Error( "plugin requires a Object." );
	}
}) ( window || this, function(require, exports, module)
{
	return {
		com: {
			title: 'Reminder'
		}
	};
});