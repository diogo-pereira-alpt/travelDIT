"use client"
import Link from "next/link";
import Container from "./container";
import meoLogo from "@/images/meo.png";


const Header = () => {
  return (
    //54 34 -> 73 53
    <header className="sm:flex sm:justify-between  px-4  bg-black text-white h-[73px]">
      <Container>
        <div className="relative px-4 sm:px-6 lg:px-8 flex  items-center justify-between w-full py-[10px]">
          <div className="flex items-center h-[53px]">

            <Link
              href={"/"}
              className="text-lg font-bold transition-colors hover:text-gray-500">
              Despesas de Viagens
            </Link>
          </div>
          <Link href={"/"} className="ml-4 lg:ml-0">
            <img src={meoLogo.src} alt="logo"
                className="w-full   left-0 object-cover md:h-8 h-6" ></img>
              {/* <Image
                src={alticeLogo}
                alt="logo"
                height={20}
                className="w-full h-full top-0 left-0 object-cover "
              /> */}
            </Link>
          {/* <UserNav /> */}
        </div>
      </Container>
    </header>
  );
};

export default Header;
