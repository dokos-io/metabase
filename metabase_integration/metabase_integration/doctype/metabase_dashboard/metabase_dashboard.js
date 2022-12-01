// Copyright (c) 2019, Frappe Technologies and contributors
// For license information, please see license.txt

frappe.ui.form.on('Metabase Dashboard', {
	refresh: function(frm) {
		frm.add_custom_button(__("View Dashboard"), () => {
			frappe.set_route("metabase-dashboard-view", {Dashboard: frm.doc.name})
		})
	}
});
