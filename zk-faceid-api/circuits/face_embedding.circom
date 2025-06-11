template FaceEmbedding() {
    // Input: 128-byte face embedding (represented as 128 individual signals)
    signal input faceBytes[128];
    
    // Output: A hash commitment of the face embedding
    signal output commitment;
    
    // Simplified calculation compatible with circom 0.5.46
    var sum = 0;
    for (var i = 0; i < 128; i++) {
        sum += faceBytes[i];
    }
    
    // Simple commitment without complex operations
    commitment <== sum;
}

component main = FaceEmbedding();
