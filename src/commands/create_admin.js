import yargs from "yargs";

console.log(yargs);
console.log(yargs().argv);

yargs()
  .command(
    "get",
    "make a get HTTP request",
    function (yargs) {
      return yargs.option("u", {
        alias: "url",
        describe: "the URL to make an HTTP request to",
      });
    },
    function (argv) {
      console.log(argv.url);
    }
  )
  .help().argv;

// yargs.command({
//   command: "create-admin",
//   describe: "Create admin user",
//   builder: {
//     userName: {
//       describe: "Enter Username",
//       demandOption: true,
//       type: "string",
//     },
//     email: {
//       describe: "Enter email",
//       demandOption: true,
//       type: "string",
//     },
//     password: {
//       describe: "Enter password",
//       demandOption: true,
//       type: "string",
//     },
//     passwordRepeat: {
//       describe: "Enter repeat password",
//       demandOption: true,
//       type: "string",
//     },
//   },
//   builder: async (argv) => {
//     console.log("userName", argv.userName);
//     console.log("email", argv.userName);
//     console.log("password", argv.userName);
//     console.log("passwordRepeat", argv.userName);
//   },
// });

yargs()
  .command("get", "make a get HTTP request", {
    url: {
      alias: "u",
      default: "http://yargs.js.org/",
    },
  })
  .help().argv;
