pragma circom 2.1.5;

template FaceEmbedding() {
    // Input: 128-byte face embedding (represented as 128 individual signals)
    signal input faceBytes[128];
    
    // Output: A hash commitment of the face embedding
    signal output commitment;
    
    // Simple hash calculation (sum of all bytes for testing)
    var sum = 0;
    for (var i = 0; i < 128; i++) {
        sum += faceBytes[i];
    }
    
    // Create the commitment output
    commitment <== sum % 2**251;
}

component main = FaceEmbedding();
