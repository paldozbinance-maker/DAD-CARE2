'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShieldAlert, Lock, Key, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';

interface SecurityVerificationDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    title?: string;
    description?: string;
    isProcessing?: boolean;
}

export function SecurityVerificationDialog({
    isOpen,
    onOpenChange,
    onConfirm,
    title = 'Security Verification',
    description = 'This is a restricted action. Please verify your identity.',
    isProcessing = false
}: SecurityVerificationDialogProps) {
    const [step, setStep] = useState(1);
    const [pin1, setPin1] = useState('');
    const [pin2, setPin2] = useState('');
    const [error, setError] = useState('');

    // Reset state when dialog opens/closes
    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setPin1('');
            setPin2('');
            setError('');
        }
    }, [isOpen]);

    const handleNextStep1 = () => {
        if (pin1 === '2919') {
            setError('');
            setStep(2);
        } else {
            setError('Invalid Verification PIN 1');
            setPin1('');
        }
    };

    const handleNextStep2 = () => {
        if (pin2 === '2135') {
            setError('');
            setStep(3);
        } else {
            setError('Invalid Verification PIN 2');
            setPin2('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent, stepNum: number) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (stepNum === 1) handleNextStep1();
            if (stepNum === 2) handleNextStep2();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md border-border glass-card shadow-2xl p-0 overflow-hidden z-[100000]">
                {/* Header Section */}
                <div className="bg-muted/30 p-6 border-b border-border flex flex-col items-center text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none -mr-16 -mt-16" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-destructive/5 rounded-full blur-2xl pointer-events-none -ml-16 -mb-16" />
                    
                    <div className={`p-4 rounded-2xl mb-4 transition-all duration-500 relative z-10 ${
                        step === 3 ? 'bg-destructive/10 text-destructive' : 
                        step === 2 ? 'bg-amber-500/10 text-amber-500' : 
                        'bg-primary/10 text-primary'
                    }`}>
                        {step === 3 ? <AlertTriangle className="w-8 h-8" /> : 
                         step === 2 ? <Key className="w-8 h-8" /> : 
                         <Lock className="w-8 h-8" />}
                    </div>
                    <DialogTitle className="text-xl font-black uppercase tracking-widest">{title}</DialogTitle>
                    <DialogDescription className="text-xs font-medium text-muted-foreground mt-1 max-w-[280px]">
                        {step === 3 ? 'Final confirmation required' : description}
                    </DialogDescription>

                    {/* Progress indicators */}
                    <div className="flex items-center justify-center gap-2 mt-6">
                        <div className={`h-1.5 w-8 rounded-full transition-all duration-500 ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
                        <div className={`h-1.5 w-8 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-amber-500' : 'bg-muted'}`} />
                        <div className={`h-1.5 w-8 rounded-full transition-all duration-500 ${step >= 3 ? 'bg-destructive' : 'bg-muted'}`} />
                    </div>
                </div>

                <div className="p-6">
                    {/* Step 1 */}
                    {step === 1 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                                    <span>Verification PIN 1</span>
                                    <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full">Layer 1</span>
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        type="password"
                                        inputMode="numeric"
                                        placeholder="••••"
                                        className="h-12 pl-10 text-center tracking-[1em] font-black text-lg focus-visible:ring-primary"
                                        value={pin1}
                                        onChange={(e) => {
                                            setPin1(e.target.value);
                                            setError('');
                                        }}
                                        onKeyDown={(e) => handleKeyDown(e, 1)}
                                        autoFocus
                                    />
                                </div>
                                {error && <p className="text-[11px] font-bold text-destructive text-center animate-in shake">{error}</p>}
                            </div>
                            <Button 
                                onClick={handleNextStep1} 
                                disabled={!pin1}
                                className="w-full h-12 font-black uppercase tracking-widest bg-primary hover:bg-primary/90 text-primary-foreground group"
                            >
                                Continue <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    )}

                    {/* Step 2 */}
                    {step === 2 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                                    <span>Verification PIN 2</span>
                                    <span className="text-[10px] text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">Layer 2</span>
                                </label>
                                <div className="relative">
                                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        type="password"
                                        inputMode="numeric"
                                        placeholder="••••"
                                        className="h-12 pl-10 text-center tracking-[1em] font-black text-lg focus-visible:ring-amber-500 border-amber-500/30"
                                        value={pin2}
                                        onChange={(e) => {
                                            setPin2(e.target.value);
                                            setError('');
                                        }}
                                        onKeyDown={(e) => handleKeyDown(e, 2)}
                                        autoFocus
                                    />
                                </div>
                                {error && <p className="text-[11px] font-bold text-destructive text-center animate-in shake">{error}</p>}
                            </div>
                            <Button 
                                onClick={handleNextStep2} 
                                disabled={!pin2}
                                className="w-full h-12 font-black uppercase tracking-widest bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20 group"
                            >
                                Verify <CheckCircle2 className="w-4 h-4 ml-2 group-hover:scale-110 transition-transform" />
                            </Button>
                        </div>
                    )}

                    {/* Step 3: Final Warning */}
                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-destructive/10 rounded-full blur-xl pointer-events-none -mr-8 -mt-8" />
                                <h4 className="text-destructive font-black text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <ShieldAlert className="w-4 h-4" />
                                    Final Warning
                                </h4>
                                <p className="text-xs text-destructive/80 font-medium leading-relaxed">
                                    You have passed the security verification. Are you absolutely sure you want to proceed? 
                                    <strong className="block mt-2 font-black">This action cannot be undone and will permanently delete the selected data.</strong>
                                </p>
                            </div>
                            
                            <div className="flex gap-3">
                                <Button 
                                    variant="outline" 
                                    className="flex-1 h-12 font-bold uppercase tracking-widest text-xs"
                                    onClick={() => onOpenChange(false)}
                                    disabled={isProcessing}
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    onClick={onConfirm}
                                    disabled={isProcessing}
                                    className="flex-1 h-12 font-black uppercase tracking-widest text-xs bg-destructive hover:bg-destructive/90 text-white shadow-lg shadow-destructive/25"
                                >
                                    {isProcessing ? 'Processing...' : 'Proceed'}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
