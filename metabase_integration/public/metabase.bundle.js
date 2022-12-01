import EditorJS from "@editorjs/editorjs";
import Block from "frappe/public/js/frappe/views/workspace/blocks/block.js";
import get_dialog_constructor from "frappe/public/js/frappe/widgets/widget_dialog.js"

class MetabaseEditDialog extends get_dialog_constructor() {
	get_fields() {
		return [
			{
				fieldname: "dashboard",
				fieldtype: "Link",
				options: "Metabase Dashboard",
				label: __("Metabase Dashboard"),
				default: "",
			},
			{
				fieldname: "height",
				fieldtype: "Int",
				label: __("Widget Height"),
				default: 25,
			},
		]
	}

	get_title() {
		return __("Title") // TODO
	}
}

export default class Metabase extends Block {
	static get toolbox() {
		return {
			title: __("Metabase"),
			icon: frappe.utils.icon("dashboard-list", "sm"),
		};
	}

	static get isReadOnlySupported() {
		return true;
	}

	constructor({ data, api, config, readOnly, block }) {
		super({ data, api, config, readOnly, block });
		this.col = this.data.col ? this.data.col : "12";
		readOnly = 0;
		this.allow_customization = !this.readOnly;
		this.options = {
			allow_sorting: this.allow_customization,
			allow_create: this.allow_customization,
			allow_delete: this.allow_customization,
			allow_hiding: false,
			allow_edit: true,
			allow_resize: true,
			min_width: 6,
			max_widget_count: 2,
		};
	}

	render() {
		// if (this.wrapper) { this.wrapper.remove() }
		this.wrapper = document.createElement("div");
		this.wrapper.classList.add("metabase-block", "widget");

		const $header = $(`<div class="metabase-block__header widget-head"></div>`).appendTo(this.wrapper);
		const $label = $(`<div class="metabase-block__label">Metabase Dashboard</div>`).appendTo($header);

		// Set-up controls
		if (!this.readOnly) {
			const $control = $(`<div class="widget-control metabase-block__control"></div>`).appendTo($header);

			this.wrapper.classList.add("edit-mode");

			this.add_new_block_button();
			this.add_settings_button();

			frappe.utils.add_custom_button(
				frappe.utils.icon("drag", "xs"),
				null,
				"drag-handle",
				__("Drag"),
				null,
				$control
			);
			frappe.utils.add_custom_button(
				frappe.utils.icon("edit", "xs"),
				() => this.edit(),
				"edit-button",
				__("Edit"),
				null,
				$control
			);
		}


		// Set-up contents
		this.get_iframe_params().then((params) => {
			this.rerender_iframe_with_params(params);
		})

		return this.wrapper;
	}

	edit() {
		const me = this
		const dialog = new MetabaseEditDialog({
			title: __("Edit", [], "Metabase"),
			type: "metabase-widget", // scrub -> unscrub for title
			label: "test",
			values: { // omit values to create new
				height: this.data.height || 25,
				dashboard: this.data.dashboard_name || "",
			},
			primary_action: (values) => {
				me.set_widget_height(values.height)
				me.set_dashboard_name(values.dashboard)
			},
		})
		dialog.make()
	}

	async get_iframe_params() {
		/* return {
			iframeUrl: "http://localhost:3000/embed/dashboard/eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyZXNvdXJjZSI6eyJkYXNoYm9hcmQiOjF9LCJwYXJhbXMiOnt9LCJleHAiOjE2Njg3NjkxODF9.N8TXahc_JFp1Et_Z5YWwU0F8u0ovne1uUrmTPTEhYi4#bordered=false&titled=false",
			resize: "http://localhost:3000/resizer.js",
		} */

		const dashboard = this.data.dashboard_name;

		if (!dashboard) {
			return null // TODO
		}

		return frappe.xcall("metabase_integration.metabase_integration.doctype.metabase_dashboard.get_url", { dashboard })
	}

	get_widget_height() {
		const height = (+this.data.height) || 25; // 0, NaN -> 25
		return Math.max(0, Math.min(100, height)); // clamp to 0-100
	}

	set_dashboard_name(newName) {
		this.data.dashboard_name = newName;
		this.get_iframe_params().then((params) => {
			this.rerender_iframe_with_params(params);
		});
	}

	rerender_iframe_with_params(params) {
		if (!params) {
			this.$resizerScript?.remove();
			this.$resizerScript = null;
			this.$iframe?.remove();
			this.$iframe = null;
			return;
		}

		const useResize = false;
		const url = params.iframeUrl;
		const resizerUrl = params.resizer;

		this.$resizerScript?.remove();
		if (resizerUrl && useResize) {
			// Add external script. TODO: Only load once.
			this.$resizerScript = $(`<script src="${resizerUrl}"></script>`)
				.appendTo(this.wrapper);
		}

		if (!url) {
			// TODO: show error, or even better: show inline dashboard picker
			this.$iframe?.remove();
		} else if (!this.$iframe) {
			// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe
			const style = useResize ? "" : `--h: ${this.get_widget_height()};`
			const scrolling = useResize ? "no" : "yes"
			this.$iframe = $(`<iframe
				class="metabase-block__iframe"
				style="${style}"
				src="${url}"
				frameborder="0"
				scrolling="${scrolling}"
				width="100%"
				sandbox="allow-downloads allow-scripts allow-same-origin"
			></iframe>`).appendTo(this.wrapper);

			if (resizerUrl && useResize) {
				this.$iframe.addEventListener("onload", function() {
					iFrameResize({}, this)
				})
			}
		} else {
			this.$iframe.attr("src", url)
		}
	}

	set_widget_height(newHeight) {
		if (isNaN(newHeight)) {
			throw new TypeError("Invalid parameter newHeight for set_widget_height: invalid value " + JSON.stringify(newHeight) + ", expected number.");
		}

		newHeight = +newHeight
		if (0 > newHeight || newHeight > 100) {
			throw new TypeError("Invalid parameter newHeight for set_widget_height: value " + newHeight + " must be between 0 and 100.");
		}

		if (this.$iframe) {
			this.$iframe.get(0).style.setProperty("--h", newHeight);
		}
		this.data.height = newHeight;
	}

	validate(savedData) {
		console.log("validate", savedData)
		return true;
	}

	save() {
		return {
			dashboard_name: this.data.dashboard_name || "",
			col: this.get_col() || 12,
			new: this.new_block_widget || "new",
			height: this.get_widget_height(),
		};
		return {}
	}
}

frappe.provide("frappe.views")

window.addEventListener("load", () => {
	// Monkey Patch the initialize_editorjs method of the Workspace class
	const originalMethod = frappe.views.Workspace.prototype.initialize_editorjs
	frappe.views.Workspace.prototype.initialize_editorjs = function initialize_editorjs_monkeypatched_metabase (...args) {
		// Call original method
		const out = originalMethod.apply(this, args)

		// Update `tools` and `blocks` to add Metabase
		// The following code works because EditorJS is initialized
		// with references to these objects.
		this.blocks["metabase"] = Metabase
		this.tools["metabase"] = {
			class: this.blocks["metabase"],
			config: {
				default_size: 12,
				page_data: this.page_data || [],
			},
		}

		if (frappe.workspace_block.blocks && !("metabase" in frappe.workspace_block.blocks)) {
			throw new Error("Metabase: initialize_editorjs monkey patch failed?")
		}

		return out
	}
})

