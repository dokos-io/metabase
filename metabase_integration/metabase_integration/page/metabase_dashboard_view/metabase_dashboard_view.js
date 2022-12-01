/* eslint require-jsdoc: 0 */

frappe.pages['metabase-dashboard-view'].on_page_load = (wrapper) => {
	// init page
	const page = frappe.ui.make_app_page({
		'parent': wrapper,
		'title': null,
		'single_column': true,
	});

	new metabase.dashboard(page, wrapper);
};
