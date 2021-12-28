from typing import Any, Dict
from sphinx.application import Sphinx


def setup(app: Sphinx) -> Dict[str, Any]:

    app.add_js_file("./static/js/present.js")

    return {
        "parallel_read_safe": True,
        "parallel_write_safe": True,
    }
