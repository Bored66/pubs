from conan import ConanFile

# deprecated packages in conan v2
from conans.client.tools.env import environment_append
from conans import tools

from conan.tools.cmake import CMake as CMakeNew
from conan.tools.cmake import CMakeDeps
from conan.tools.cmake import CMakeToolchain
from conan.tools.cmake import cmake_layout
from conan.tools.microsoft import is_msvc

from contextlib import contextmanager
import os

required_conan_version = ">=1.49.0"

class MGTConan(ConanFile):
    name = "mgt"
    homepage = ""
    description = ""
    settings = "os", "arch", "compiler", "build_type"

    tsnative_pkg_version = "0.4.16"

    options = {
        "shared": [True, False, None],
        "build_ts": [True, False, None],
        "build_examples": [True, False, None],
        "build_tests": [True, False, None],
        "ccache": [True, False, None],
        "compiler_extra_warnings": [True, False, None],
        "compiler_warnings_are_error": [True, False, None],
        "debug": [True, False, None],
        "disable_hidden_symbols": [True, False, None],
        "disable_hw_rendering_api": [True, False, None],
        "enable_stack_tracing": [True, False, None],
        "enable_wayland": [True, False, None],
        "prepare_npm_package": [True, False, None],
        "ui_benchmark_mode": [True, False, None],
        "ui_debug_widget_frame": [True, False, None],
        "ui_use_pedantic_mode": [True, False, None],
        "ui_use_scene_profiler": [True, False, None],
        "with_lto": [True, False, None],
    }

    # If specified None the default values from CMakeLists will be used
    default_options = {
        "shared": None,
        "build_ts": True,
        "build_examples": None,
        "build_tests": None,
        "ccache": None,
        "compiler_extra_warnings": None,
        "compiler_warnings_are_error": None,
        "debug": None,
        "disable_hidden_symbols": None,
        "disable_hw_rendering_api": None,
        "enable_stack_tracing": None,
        "enable_wayland": None,
        "prepare_npm_package": None,
        "ui_benchmark_mode": None,
        "ui_debug_widget_frame": None,
        "ui_use_pedantic_mode": None,
        "ui_use_scene_profiler": None,
        "with_lto": None
    }

    library_directories = "app", "bpl", "cpl", "graphics", "pal", "signals", "ts", "ui", "widgets", "emb", "vfs"
    cmake_directories = "cmake", "thirdparty"
    exports_sources = ("CMakeLists.txt",  "mgtConfig.cmake",  "README.md", "builder/*") + \
            tuple(os.path.join(path, "*") for path in library_directories) + \
            tuple(os.path.join(path, "*") for path in cmake_directories)

    def validate(self):
        if self.settings.compiler.get_safe("cppstd"):
            tools.check_min_cppstd(self, 14)

    def requirements(self):
        self.requires("abseil/20211102.0")
        self.requires("benchmark/1.6.1")
        self.requires("expat/2.4.8")
        self.requires("libpng/1.6.37")
        self.requires("glm/0.9.9.8")
        self.requires("gtest/1.11.0")
        self.requires("miniz/2.2.0")

    def build_requirements(self):
        # self.build_requires("cmake/3.23.1")
        self.build_requires("ninja/1.10.2")

    def run_environment(fn):
        @contextmanager
        def no_op():
            yield
        def wrapper(self):
            with tools.run_environment(self) if not self.options.build_tests == 'None' else no_op():
                fn(self)
        return wrapper

    def platform_extension(fn):
        def wrapper(*args, **kwargs):
            self = args[0]
            method_name = "{}_{}".format(fn.__name__, str(self.settings.os).lower())
            if callable(getattr(self, method_name, None)):
                getattr(self, method_name, None)(*args[1:], **kwargs);
            fn(*args, **kwargs)
        return wrapper

    def configure_android(self):
        self.options.build_ts = False
        self.options.build_tests = False
        self.options.build_examples = False

    @platform_extension
    def configure(self):
        # Put platform independent settings here
        pass

    def configure_toolchain_android(self, tc: CMakeToolchain):
        tc.variables["ANDROID_SDK_ROOT"] = os.environ.get("ANDROID_SDK", "/opt/android-sdk")

    @platform_extension
    def configure_toolchain(self, tc):
        def remove_prefix(name: str):
            return name[4:] if name.startswith('MGT_') else name

        def apply_flag(cmake_name: str, opt = None):
            option_name = remove_prefix(cmake_name).lower() if not opt else opt
            option_value = getattr(self.options, option_name)
            # XXX: there is a bug in conans.model.option.PackageOption.__eq__(): we have to compare
            # option value with string 'None'
            if not option_value == 'None':
                print("Set cmake variable {} with value: {}".format(cmake_name, option_value))
                tc.variables[cmake_name] = bool(option_value)

        apply_flag("BUILD_TESTS")
        apply_flag("BUILD_EXAMPLES")
        apply_flag("BUILD_TS_LAYER", "build_ts")
        apply_flag("BUILD_SHARED_LIBS", "shared")
        apply_flag("UI_BENCHMARK_MODE")
        apply_flag("UI_DEBUG_WIDGET_FRAME")
        apply_flag("UI_USE_PEDANTIC_MODE")
        apply_flag("UI_USE_SCENE_PROFILER")
        apply_flag("WITH_LTO")


        if self.options.build_ts:
            if self.settings.target_abi is None:
                self.output.error("Target ABI is not specified. Please provide settings.target_abi value")
            else:
                self.output.info("Target ABI is %s" % self.settings.target_abi)
                tc.variables["CMAKE_CXX_COMPILER_TARGET"] = self.settings.target_abi

    def layout(self):
        # Ignore layout if we create a package
        if self.in_local_cache:
            return

        # conan overwrites this with cmd line args
        # self.folders.set_base_folders(".", "out")

        output_folder = os.path.abspath("out")

        self.folders.build = "build-{}-{}".format(self.name, self.settings.get_safe("build_type")).lower()
        self.folders.build = os.path.join(output_folder, self.folders.build)
        self.folders.generators = os.path.join(self.folders.build, "cmake-deps")
        self.folders.imports = os.path.join(self.folders.build, "imports")

        # XXX: Hack. Conan doesn't set CMAKE_INSTALL_PREFIX if we do not specify this
        self.folders.set_base_package(os.path.join(self.folders.build, "package"))

    def generate(self):
        tc = CMakeToolchain(self, "Unix Makefiles")
        self.configure_toolchain(tc)
        tc.generate()

        cmake = CMakeDeps(self)
        if self.options.build_ts:
            cmake.build_context_activated = ["tsnative-declarator"]
        cmake.generate()

    @run_environment
    def build(self):
        cmake = CMakeNew(self)
        cmake.configure()
        cmake.build()
        cmake.install()

        if self.options.build_tests:
            args = ["ARGS=-E Config*"] if tools.os_info.is_windows else []
            with environment_append({'CTEST_OUTPUT_ON_FAILURE': '1'}):
                cmake.test(build_tool_args=args)

    @property
    def _cmake_module_path(self):
        # Have to be absolute
        return os.path.join(self.package_folder, "lib", "cmake")

    # TODO: install examples and tests
    def package(self):
        cmake = CMakeNew(self)
        cmake.configure()
        cmake.install()

    def package_id(self):
        del self.info.options.build_examples
        del self.info.options.build_tests
        del self.info.options.ccache
        del self.info.options.compiler_extra_warnings
        del self.info.options.compiler_warnings_are_error

    def package_info(self):
        self.cpp_info.set_property("cmake_file_name", "mgt")
        self.cpp_info.set_property("cmake_target_name", "mgt")
        self.cpp_info.set_property("cmake_build_modules", [os.path.join(self._cmake_module_path, "mgt", "mgtConfig.cmake")])

        build_dir = self.package_folder

        # TODO: We need a fullpath to package dir to import ts declarations in editable mode but conan doesn't add it.
        if build_dir not in self.cpp_info.builddirs:
            self.cpp_info.builddirs.append(build_dir)

        # mgtConfig.cmake find packages relative to this path. I suppose...
        self.cpp_info.builddirs.append(os.path.join(self._cmake_module_path))

        print("CPP_INFO builddirs: ", "\n\t".join(self.cpp_info.builddirs))

        self.cpp_info.names["cmake_find_package"] = "mgt"
        self.cpp_info.names["cmake_find_package_multi"] = "mgt"

    def tsnative_version(self):
        if "TSNATIVE_VERSION" in os.environ and os.environ['TSNATIVE_VERSION'].strip() != '':
            return os.environ['TSNATIVE_VERSION']
        else:
            return self.tsnative_pkg_version
