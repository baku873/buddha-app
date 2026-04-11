# Rust Integration for Performance 🦀

This project now includes a Rust WebAssembly module to optimize heavy data processing (sorting and ranking monks).

## Setup Instructions

1.  **Install Rust:**
    If you haven't already, install Rust and Cargo:
    ```bash
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
    source $HOME/.cargo/env
    ```

2.  **Install wasm-pack:**
    ```bash
    curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
    ```

3.  **Build the Rust Module:**
    Run the provided script to compile the Rust code to WebAssembly:
    ```bash
    ./build-rust.sh
    ```

4.  **Install the Wasm Package:**
    After building, link the package to your project:
    ```bash
    npm install ./rust-modules/pkg
    ```

5.  **Restart Development Server:**
    ```bash
    npm run dev
    ```

## Verification
Open the application and check the console. You should see:
`Using Rust Wasm for Monk Processing 🦀`
If the Wasm module is not found, the app will gracefully fallback to the standard JavaScript implementation.
