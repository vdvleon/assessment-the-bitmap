import main from "./main";

main(process.stdin, process.stdout, process.stderr)
    .catch(err => {
        console.error(err);
    });
