import { AlertCircle, FileText, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface SetupGuideProps {
    onSkip?: () => void;
}

export default function SetupGuide({ onSkip }: SetupGuideProps) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <Card className="w-full max-w-2xl shadow-xl">
                <CardHeader className="text-center border-b bg-white rounded-t-xl pb-8">
                    <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        <AlertCircle className="h-8 w-8 text-blue-600" />
                    </div>
                    <CardTitle className="text-3xl font-bold text-slate-800">Welcome to Auto Import Specialists</CardTitle>
                    <CardDescription className="text-lg mt-2">
                        Application Setup Required
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-8 px-8">
                    <div className="space-y-6">
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800 flex items-start gap-3">
                            <FileText className="h-5 w-5 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold">Missing Environment Configuration</h3>
                                <p className="text-sm mt-1 text-amber-700">
                                    The application cannot connect to Firebase because the configuration keys are missing.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold text-slate-800">How to Fix This:</h3>

                            <ol className="space-y-4">
                                <li className="flex gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">1</div>
                                    <div>
                                        <h4 className="font-medium text-slate-900">Locate the Example File</h4>
                                        <p className="text-slate-600">Find the file named <code className="bg-slate-100 px-2 py-0.5 rounded text-sm font-mono">.env.example</code> in the root directory.</p>
                                    </div>
                                </li>

                                <li className="flex gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">2</div>
                                    <div>
                                        <h4 className="font-medium text-slate-900">Create Your .env File</h4>
                                        <p className="text-slate-600">Rename it to <code className="bg-slate-100 px-2 py-0.5 rounded text-sm font-mono">.env</code> or create a new file with that name.</p>
                                    </div>
                                </li>

                                <li className="flex gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">3</div>
                                    <div>
                                        <h4 className="font-medium text-slate-900">Add Your Credentials</h4>
                                        <p className="text-slate-600 mb-2">Fill in your Firebase configuration keys:</p>
                                        <div className="bg-slate-900 text-slate-300 p-4 rounded-md font-mono text-sm overflow-x-auto">
                                            <p>VITE_FIREBASE_API_KEY=your_api_key_here</p>
                                            <p>VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com</p>
                                            <p>VITE_FIREBASE_PROJECT_ID=your_project_id</p>
                                            <p>...</p>
                                        </div>
                                    </div>
                                </li>

                                <li className="flex gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">4</div>
                                    <div>
                                        <h4 className="font-medium text-slate-900">Restart the Server</h4>
                                        <p className="text-slate-600">After creating the file, restart your application to load the new settings.</p>
                                    </div>
                                </li>
                            </ol>
                        </div>

                        <div className="pt-6 border-t space-y-4">
                            {onSkip && (
                                <Button onClick={onSkip} variant="outline" className="w-full">
                                    Skip & View Demo Website
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            )}

                            <div className="flex items-center justify-center text-slate-500 text-sm">
                                <Check className="h-4 w-4 mr-2" />
                                <span>Once configured, this screen will automatically disappear.</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
