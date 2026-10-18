package archrules;

import static com.tngtech.archunit.core.domain.AccessTarget.Predicates.declaredIn;
import static com.tngtech.archunit.core.domain.JavaCall.Predicates.target;
import static com.tngtech.archunit.core.domain.properties.HasName.Predicates.name;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;
import static com.tngtech.archunit.library.dependencies.SlicesRuleDefinition.slices;

import com.tngtech.archunit.core.domain.JavaClasses;
import com.tngtech.archunit.core.importer.ClassFileImporter;
import com.tngtech.archunit.core.importer.ImportOption;
import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/** docs/architecture.md の 4.2 (バックエンドのモジュール間の依存の向き) のルール。 */
class ArchitectureRulesTest {
  private static final String BASE = "com.example.app";
  private static final String FEATURE = BASE + ".(*)..";

  private static JavaClasses classes;

  @BeforeAll
  static void importClasses() {
    Path dir = Path.of(System.getProperty("archunit.classesDir"));
    if (!Files.isDirectory(dir)) {
      throw new IllegalStateException("クラスファイルのディレクトリが無い: " + dir);
    }
    classes = new ClassFileImporter().withImportOption(new ImportOption.DoNotIncludeTests()).importPath(dir);
    if (classes.isEmpty()) {
      throw new IllegalStateException("クラスファイルが無い: " + dir);
    }
  }

  @Test
  void 機能のパッケージは基底のパッケージ直下のクラスに依存しない() {
    noClasses()
        .that()
        .resideInAPackage(BASE + "..")
        .and()
        .resideOutsideOfPackage(BASE)
        .should()
        .dependOnClassesThat()
        .resideInAPackage(BASE)
        .allowEmptyShould(true)
        .check(classes);
  }

  @Test
  void 機能のパッケージは別の機能のパッケージに依存しない() {
    slices()
        .matching(FEATURE)
        .should()
        .notDependOnEachOther()
        .allowEmptyShould(true)
        .check(classes);
  }

  @Test
  void 境界のクラス以外はJavalinに依存しない() {
    noClasses()
        .that()
        .resideInAPackage(BASE + "..")
        .and()
        .resideOutsideOfPackage(BASE)
        .and()
        .areNotAssignableTo("io.javalin.http.Handler")
        .should()
        .dependOnClassesThat()
        .resideInAPackage("io.javalin..")
        .allowEmptyShould(true)
        .check(classes);
  }

  @Test
  void healthパッケージはデータベースに関わるものに依存しない() {
    noClasses()
        .that()
        .resideInAPackage(BASE + ".health..")
        .should()
        .dependOnClassesThat()
        .resideInAnyPackage("java.sql..", "javax.sql..", "org.jooq..", "org.postgresql..")
        .allowEmptyShould(true)
        .check(classes);
  }

  @Test
  void greetingパッケージはデータベースに関わるものに依存しない() {
    noClasses()
        .that()
        .resideInAPackage(BASE + ".greeting..")
        .should()
        .dependOnClassesThat()
        .resideInAnyPackage("java.sql..", "javax.sql..", "org.jooq..", "org.postgresql..")
        .allowEmptyShould(true)
        .check(classes);
  }

  @Test
  void textlengthパッケージはデータベースに関わるものに依存しない() {
    noClasses()
        .that()
        .resideInAPackage(BASE + ".textlength..")
        .should()
        .dependOnClassesThat()
        .resideInAnyPackage("java.sql..", "javax.sql..", "org.jooq..", "org.postgresql..")
        .allowEmptyShould(true)
        .check(classes);
  }

  @Test
  void 境界のクラス以外はJacksonに依存しない() {
    noClasses()
        .that()
        .resideInAPackage(BASE + "..")
        .and()
        .resideOutsideOfPackage(BASE)
        .and()
        .areNotAssignableTo("io.javalin.http.Handler")
        .should()
        .dependOnClassesThat()
        .resideInAPackage("com.fasterxml.jackson..")
        .allowEmptyShould(true)
        .check(classes);
  }

  @Test
  void パッケージの間に循環した依存が無い() {
    slices().matching(BASE + ".(**)").should().beFreeOfCycles().allowEmptyShould(true).check(classes);
  }

  @Test
  void 機能どうしの間に循環した依存が無い() {
    slices().matching(FEATURE).should().beFreeOfCycles().allowEmptyShould(true).check(classes);
  }

  @Test
  void 環境変数の読み取りはApplicationだけに許す() {
    noClasses()
        .that()
        .doNotHaveFullyQualifiedName(BASE + ".Application")
        .should()
        .callMethodWhere(target(name("getenv")).and(target(declaredIn(System.class))))
        .allowEmptyShould(true)
        .check(classes);
  }
}
