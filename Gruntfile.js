const pkg = require("./package.json");
const cp = require("child_process");
const os = require("os");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");


const PATH_DIST = path.resolve(process.cwd(), "dist");
const PATH_BUILD = path.resolve(process.cwd(), "build");

process.env = Object.assign({
    NODE_ENV: "production"
}, process.env);

module.exports = function (grunt) {

    grunt.initConfig({
        pkg,
        uglify: {
            options: {
                mangle: {
                    toplevel: true
                }
            },
            build: {
                files: [{
                    expand: true,
                    src: [
                        "**/*.js",
                        "**/*.gitkeep",
                        "!Gruntfile.js",
                        "!node_modules/**",
                        "!wizard/**"
                    ],
                    dest: PATH_BUILD,
                }]
            }
        }
    });

    grunt.loadNpmTasks("grunt-contrib-uglify");

    grunt.registerTask("build", () => {
        [
            `rm -rf ${path.join(PATH_BUILD, "/*")}`,
            `rm -rf ${path.join(PATH_DIST, "/*")}`,
            `mkdir -p ${PATH_BUILD}`,
            `mkdir -p ${PATH_DIST}`,
            `cp package*.json ${PATH_BUILD}`,
            "grunt uglify",
        ].forEach((cmd) => {
            cp.execSync(cmd, {
                env: process.env,
                stdio: "inherit"
            });
        });
    });

    grunt.registerTask("compress", () => {
        cp.execSync(`cd ${PATH_BUILD} && tar -czvf ${path.join(PATH_DIST, `${pkg.name}-v${pkg.version}.tgz`)} *`, {
            env: process.env,
            stdio: "inherit"
        });
    });

    grunt.registerTask("checksum", () => {

        let m5f = path.join(PATH_DIST, "./checksums.md5");
        let s256f = path.join(PATH_DIST, "./checksums.sha256");

        fs.rmSync(m5f, { force: true });
        fs.rmSync(s256f, { force: true });

        let files = fs.readdirSync(PATH_DIST);

        let fdMd5 = fs.openSync(m5f, "w");
        let fdS256 = fs.openSync(s256f, "w");

        files.forEach((name) => {

            let file = path.join(PATH_DIST, name);
            let content = fs.readFileSync(file);

            let hasherMd5 = crypto.createHash("md5");
            let hashMd5 = hasherMd5.update(content).digest("hex");

            let hashers256 = crypto.createHash("sha256");
            let hashS256 = hashers256.update(content).digest("hex");

            fs.writeSync(fdMd5, `${hashMd5}\t${name}${os.EOL}`);
            fs.writeSync(fdS256, `${hashS256}\t${name}${os.EOL}`);

        });

        fs.closeSync(fdMd5);
        fs.closeSync(fdS256);

    });

    grunt.registerTask("release", () => {
        [
            "grunt build",
            "grunt compress",
            "grunt checksum"
        ].forEach((cmd) => {
            cp.execSync(cmd, {
                env: process.env,
                stdio: "inherit"
            });
        });
    });

};
