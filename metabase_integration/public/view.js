frappe.provide("frappe.views");

frappe.views.MetabaseView = class MetabaseView extends frappe.views.ListView {
	get view_name() {
		// __("Metabase")
		return "Metabase";
	}

	setup_page() {
		this.hide_page_form = true;
		this.hide_page_form = true;
		this.hide_filters = true;
		this.hide_sort_selector = true;
		super.setup_page();
		this.toggle_side_bar(true)
	}

	setup_view() {
		if (this.chart_group || this.number_card_group) {
			return;
		}

		this.setup_metabase_page();

		this.filter_area && this.filter_area.$filter_list_wrapper.hide();
	}

	render() {
		this.render_metabase_dashboard();
	}

	setup_side_bar() {
		//
	}

	set_primary_action() {
		// Don't render Add doc button for documentation view
	}

	setup_metabase_page() {
		const metabase_wrapper_html = `<div class="metabase-view"></div>`;

		this.$frappe_list.html(metabase_wrapper_html);
		this.page.clear_secondary_action();

		this.$metabase_wrapper = this.$page.find(".metabase-view");

		frappe.utils.bind_actions_with_object(this.$metabase_wrapper, this);
	}

	render_metabase_dashboard() {
		this.$metabase_wrapper.empty();

		new metabase.dashboard(this.page, this.$metabase_wrapper, this.doctype);
	}

	render_empty_state() {
		const no_result_message_html = `<p>${__(
			"No metabase dashboard available for this document type."
		)}`;

		const empty_state_image = "/assets/frappe/images/ui-states/list-empty-state.svg";

		const empty_state_html = `<div class="msg-box no-border empty-dashboard">
			<div>
				<img src="${empty_state_image}" alt="Generic Empty State" class="null-state">
			</div>
			${no_result_message_html}
		</div>`;

		this.$documentation_wrapper.append(empty_state_html);
		this.$empty_state = this.$documentation_wrapper.find(".empty-dashboard");
	}
};

class MetabaseListViewSelect extends frappe.views.ListViewSelect {
	setup_views() {
		super.setup_views();
		if (this.current_view !== "Metabase") {
			this.add_view_to_menu("Metabase", () => {this.set_route("metabase")});
		}
	}

	set_current_view() {
		super.set_current_view();
		const route = frappe.get_route();
		const view_name = frappe.utils.to_title_case(route[2] || "");
		if (route.length > 2 && view_name == "Metabase") {
			this.current_view = view_name;
		}
	}
}

Object.assign(frappe.views.BaseList.icon_map, {
	Metabase: "dashboard-list"
})

document.addEventListener("DOMContentLoaded", function() {
	frappe.views.ListViewSelect = MetabaseListViewSelect;

	frappe.router.factory_views.push("metabase");
	frappe.router.list_views.push("metabase");
	frappe.router.list_views_route["metabase"] = "Metabase";
})