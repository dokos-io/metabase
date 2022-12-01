frappe.provide("metabase")

metabase.dashboard = class MetabaseDashboard {
	constructor(page, wrapper, doctype) {
		this.currentDashboard = false;
		this.page = page;
		this.wrapper = wrapper;
		this.doctype = doctype;
		this.pageMain = $(page.main);
		this.pageTitle = $(this.wrapper).find('.title-text');
		this.filters = [
			["Metabase Dashboard", "is_active", "=", 1],
		]

		if (this.doctype) {
			this.filters.push(
				["Metabase Linked DocTypes", "doc_type", "=", this.doctype]
			)
		}

		frappe.db.get_list("Metabase Dashboard", { filters: this.filters }).then(r => {
			this.default_dashboard = r.length == 1 ? r[0].name : null;
			this.createSelectionField();
			if (this.default_dashboard) {
				this.selectionField.set_value(r[0].name)
			}
		})
	}

	showIframe() {
		this.getSettings().then(
			(r) => {
				// set variable
				this.settings = r.message;
				this.resizer = this.settings.resizer;
				this.iframeUrl = this.settings.iframeUrl;
				this.name = this.settings.name;

				if (this.iframeUrl && this.resizer) {
					// prepare html
					const iFrameHtml = `
						<script id="resizer" src="${this.resizer}"></script>
						<iframe
							src="${this.iframeUrl}"
							frameborder="0"
							width=100%
							onload="iFrameResize({}, this)"
							allowtransparency
						></iframe>
					`;

					// append html to page
					this.iFrame = $(iFrameHtml).appendTo(this.pageMain);
				}
			}
		);
	}

	getSettings() {
		return frappe.call({
			'method': 'metabase_integration.metabase_integration.doctype.metabase_dashboard.get_url',
			'args': {
				'dashboard': this.dashboardName,
			},
		});
	}

	createSelectionField() {
		// create dashboard selection field
		if (!$(".metabase-filter").length) {
			const filter_html = `<div class="metabase-filter"></div>`;
			this.page.custom_actions.prepend(filter_html);
		} else {
			this.page.custom_actions.find(".metabase-filter").empty()
		}

		this.selectionField = frappe.ui.form.make_control({
			parent: this.page.custom_actions.find(".metabase-filter"),
			df: {
				fieldname: 'dashboard',
				fieldtype: 'Link',
				options: 'Metabase Dashboard',
				onchange: () => {
					const dashboardName = this.selectionField.get_value();
					if (dashboardName) {
						this.dashboardName = dashboardName;
						if (this.currentDashboard != this.dashboardName) {
							// clear page html
							this.pageMain.empty();

							this.showIframe();
							this.changeTitle();

							// set current dashboard
							this.currentDashboard = this.dashboardName;
						}
						// clear input
						this.selectionField.set_input('');
					}
				},
				get_query: () => {
					return {
						filters: this.filters
					}
				},
				placeholder: __('Select Dashboard'),
			},
			render_input: true,
		});

		this.page.custom_actions.removeClass("hide");
	}

	changeTitle() {
		this.pageTitle.text(`${this.dashboardName} Dashboard`);
	}
}