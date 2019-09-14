using System;
using Xamarin.Forms;
using Xamarin.Forms.Xaml;

namespace AustinHackathon
{
    public partial class App : Application
    {
        public App()
        {
            InitializeComponent();

            MainPage = new NavigationPage(new SplashScreen());
        }

        protected override void OnStart()
        {
            // Handle when your app startsB
        }

        protected override void OnSleep()
        {
            // Handle when your app sleeps
        }

        protected override void OnResume()
        {
            // Handle when your app resumes
        }
    }
}
