#include <iostream>
#include <string>
#include <vector>

// VAMPIRE: Pass by value (COSTLY COPYING)
void logMessage(std::string message) {
    std::cout << message << std::endl;
}

int main() {
    // VAMPIRE: Raw pointer (MANUAL MEMORY LIFE-CYCLE)
    int* data = new int[100];
    
    for (int i = 0; i < 100; i++) {
        data[i] = i;
    }

    delete[] data;
    return 0;
}
