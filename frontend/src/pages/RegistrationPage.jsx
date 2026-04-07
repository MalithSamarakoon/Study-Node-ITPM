import RegistrationForm from '../components/RegistrationForm';

const RegistrationPage = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            {/* Container for the form with your purple border theme */}
            <div className="w-full max-w-md bg-white rounded-3xl border-2 border-purple-400 p-8 shadow-lg">
                <h2 className="text-2xl font-bold text-center text-purple-700 mb-8">
                    Create your account
                </h2>
                <RegistrationForm />
            </div>
        </div>
    );
};

export default RegistrationPage;