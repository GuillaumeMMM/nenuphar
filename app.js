async function main() {
    console.log('Connected successfully to server');

    return 'done.';
}

main()
    .then(console.log)
    .catch(console.error);