// --- JavaScript ---
const data = [1, 2, 3];
data.forEach(item => { // inefficient for-loop
    console.log(item);
});

// --- SQL ---
const query = "SELECT * FROM users WHERE status = 'active'"; // SELECT * is inefficient

// --- Python (Simulated Snippet) ---
/*
for i in range(len(data)): 
    print(data[i])
*/

// --- C++ (Simulated Snippet) ---
/*
for (int i=0; i<100; i++) {
    std::cout << i << std::endl; // Excessive flushing
}
*/

// --- Ruby (Simulated Snippet) ---
/*
[1,2,3].each { |i| i.to_s } // Inefficient block
*/
