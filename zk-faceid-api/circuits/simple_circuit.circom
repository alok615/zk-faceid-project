pragma circom 2.0.0;

template FaceProof() {
    // Private inputs
    signal private input signal_hash;
    signal private input nullifier_hash;
    
    // 4 Public outputs for verifier integration
    signal output public_signal_0;
    signal output public_signal_1; 
    signal output public_signal_2;
    signal output public_signal_3;
    
    // Extract 4 public signals from the private inputs
    public_signal_0 <== signal_hash % (2**64);
    public_signal_1 <== (signal_hash \ (2**64)) % (2**64);
    public_signal_2 <== nullifier_hash % (2**64);
    public_signal_3 <== (nullifier_hash \ (2**64)) % (2**64);
}

component main = FaceProof();
