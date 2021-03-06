using System.Collections.Generic;
using System.Linq;

using AutoMapper;
using Microsoft.AspNetCore.JsonPatch;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using ofisprojesi;

namespace Ofisprojesi
{
    public interface IFixtureServices
    {
        FixtureDto[] GetFixtureByName(string name, bool? status);
        FixtureDto GetFixtureById(int id);
        DbActionResult DeleteFixtureById(int? id);
        DbActionResult SaveFixture(FixtureUpdateDto fixtureupdatedto);
        DbActionResult UpdateFixture(FixtureUpdateDto fixtureupdatedto, int? id, bool? status);
        Fixture UpdatePatch(int id, JsonPatchDocument<Fixture> name);
    }

    public class FixtureService : IFixtureServices
    {
        private OfisProjesiContext _context;
        private IMapper _mapper;
        public FixtureService(OfisProjesiContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }
        public DbActionResult DeleteFixtureById(int? id)
        {
            Fixture fixture = _context.Fixtures.FirstOrDefault(p => p.Id == id);
            if (fixture == null) return DbActionResult.UnknownError;

            Debit debit = _context.Debits.Where(p => p.FixtureId == id).FirstOrDefault();
            if (debit != null) return DbActionResult.HaveDebitError;

            _context.Fixtures.Remove(fixture);
            _context.SaveChanges();

            return DbActionResult.Successful;
        }

        public FixtureDto GetFixtureById(int id)
        {
            Fixture fixture = _context.Fixtures.Where(p => p.Id == id).FirstOrDefault();

            if (fixture == null) return null;

            FixtureDto dto = _mapper.Map<FixtureDto>(fixture);
            return dto;
        }

        public FixtureDto[] GetFixtureByName(string name, bool? status)
        {
            Fixture[] fixture = _context.Fixtures.ToArray();
            
            if (name == null && status == null)
            {
                return null;
            }
            if (!string.IsNullOrWhiteSpace(name))
            {

                fixture = fixture.Where(p => p.Name.Contains(name)).ToArray();
            }
            if (status.HasValue)
            {
                fixture = fixture.Where(p => p.Status == status).ToArray();
            }
            {
                FixtureDto[] fixtureDto = _mapper.Map<FixtureDto[]>(fixture);
                foreach (FixtureDto fixtureList in fixtureDto)
                {
                    Debit[] debits = _context.Debits.Where(p => p.EmployeeId == fixtureList.id).ToArray();
                    DebitDto[] debitDto = _mapper.Map<DebitDto[]>(debits);
                    fixtureList.debits = debitDto;
                }

                return fixtureDto;
            }
        }
        public DbActionResult SaveFixture(FixtureUpdateDto fixtureupdatedto)
        {
            if (fixtureupdatedto == null)
            {
                return DbActionResult.UnknownError;
            }
            Office office = _context.Offices.Where(p => p.Id == fixtureupdatedto.Officeid).SingleOrDefault();
            Fixture Fixture = new Fixture();
            Fixture.Name = fixtureupdatedto.name;
            Fixture.OfficeId = fixtureupdatedto.Officeid;
            Fixture.Status = true;
            Fixture.Recdate = System.DateTime.Now;
            Fixture.Updatedate = System.DateTime.Now;
            if (fixtureupdatedto.name == null)
            {
                return DbActionResult.NameOrLastNameError;
            }
            if (fixtureupdatedto.Officeid == null || fixtureupdatedto.Officeid < 0 || office == null)
            {
                return DbActionResult.OfficeNotFound;
            }
            _context.Fixtures.Add(Fixture);
            _context.SaveChanges();
            FixtureDto dto = _mapper.Map<FixtureDto>(Fixture);
            return DbActionResult.Successful;
        }


        public DbActionResult UpdateFixture(FixtureUpdateDto fixtureupdatedto, int? id, bool? status)
        {
            if (fixtureupdatedto.name == null)
            {
                return DbActionResult.NameOrLastNameError;
            }
            if (fixtureupdatedto == null)
            {
                return DbActionResult.UnknownError;
            }
            Fixture Fixture = _context.Fixtures.Where(p => p.Id == id).SingleOrDefault();
            if (Fixture == null)
                return DbActionResult.UnknownError;
            Office office = _context.Offices.Where(p => p.Id == fixtureupdatedto.Officeid).SingleOrDefault();
            if (office == null)
                return DbActionResult.OfficeNotFound;
            Fixture.Name = fixtureupdatedto.name;
            Fixture.Status = status;
            Fixture.OfficeId = fixtureupdatedto.Officeid;
            Fixture.Recdate = Fixture.Recdate;
            Fixture.Updatedate = System.DateTime.Now;
            _context.SaveChanges();
            FixtureUpdateDto dto = _mapper.Map<FixtureUpdateDto>(fixtureupdatedto);

            return DbActionResult.Successful;
        }

        public Fixture UpdatePatch(int id, JsonPatchDocument<Fixture> name)
        {
            Fixture fixture = _context.Fixtures.FirstOrDefault(e => e.Id == id);

            name.ApplyTo(fixture);
            _context.SaveChanges();

            return fixture;
        }
    }
}